import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  setConversations,
  setActiveChat,
  setMessages,
  setActiveCategory,
  prependConversation,
  clearConversationUnread,
  removeMessage,
} from "../store/slices/chatSlice";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { apiURL } from "../utils/exports";
import Modal from "../components/Modal";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";

const CATEGORY_LABELS = {
  staff: "Staff",
  customers: "Customers",
  contractors: "Resource Partners",
  admin: "Admin Support",
};

const Avatar = ({ src, name, size = 40 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !imgError) {
    return (
      <img
        src={src}
        onError={() => setImgError(true)}
        alt={name}
        width={size}
        height={size}
        className="rounded-circle"
        style={{ objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0A7C6E, #075e53)",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
};

const ChatRoom = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userdata, token } = useSelector((state) => state.auth);
  const { conversations, activeConversation, messages } = useSelector(
    (state) => state.chat,
  );

  const currentUser = userdata?.data || userdata || {};
  const userType =
    userdata?.user_type?.toLowerCase() ||
    userdata?.data?.user_type?.toLowerCase() ||
    "";

  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [mobileChatActive, setMobileChatActive] = useState(false);
  const scrollRef = useRef();
  const pickerRef = useRef();

  const isMobileView = () => window.innerWidth < 768;

  const {
    data: convData,
    loading: loadingConv,
    refetch: refetchConversations,
  } = useFetch(`api/messages/conversations`, { isAuth: true });

  let userEndpoint = null;
  if (showUserPicker) {
    if (userType === "admin") {
      if (category === "staff") userEndpoint = "api/admin/get-staff?limit=500";
      else if (category === "customers") userEndpoint = "api/admin/get-customers?limit=500";
      else if (category === "contractors") userEndpoint = "api/admin/get-contractors?limit=500";
    } else {
      userEndpoint = "api/admin";
    }
  }

  const { data: usersData, loading: loadingUsers } = useFetch(userEndpoint, {
    isAuth: true,
  });

  const { submit: sendMessageApi, loading: sending } = useSubmit({
    isAuth: true,
  });

  useEffect(() => {
    dispatch(setActiveCategory(category));
  }, [category, dispatch]);

  useEffect(() => {
    if (convData) {
      const list = convData?.data || convData || [];
      dispatch(setConversations(Array.isArray(list) ? list : []));
    }
  }, [convData, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowUserPicker(false);
      }
    };
    if (showUserPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserPicker]);

  const fetchMessages = useCallback(
    async (userId) => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `${apiURL}api/messages/conversation/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const responseData = await res.json();
        const messageList =
          responseData?.messages?.data || responseData?.data || [];
        dispatch(setMessages(messageList));
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    },
    [token, dispatch],
  );

  const markMessagesAsRead = async (userId) => {
    try {
      await fetch(`${apiURL}api/messages/read-all/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      dispatch(clearConversationUnread(userId));
      refetchConversations();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const askDeleteMessage = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const handleDeleteMessage = async () => {
    const messageId = messageToDelete?.id;
    if (!messageId) return;

    setShowDeleteModal(false);
    setMessageToDelete(null);

    try {
      await fetch(`${apiURL}api/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(removeMessage(messageId));
      refetchConversations();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleSelectConv = (conv) => {
    const other = otherUser(conv);
    const isSameConv = activeConversation?.user?.id === other?.id;

    if (isSameConv && isMobileView()) {
      setMobileChatActive(true);
      return;
    }

    dispatch(setActiveChat(conv));
    if (other?.id) {
      fetchMessages(other.id);
      markMessagesAsRead(other.id);
    }
    if (isMobileView()) {
      setMobileChatActive(true);
    }
  };

  const handleStartConversation = async (targetUser) => {
    setShowUserPicker(false);

    const conv = {
      user: targetUser,
      last_message: null,
      unread_count: 0,
    };

    dispatch(prependConversation(conv));
    dispatch(setActiveChat(conv));
    fetchMessages(targetUser.id);
    markMessagesAsRead(targetUser.id);

    if (isMobileView()) {
      setMobileChatActive(true);
    }
  };

  const handleBackToList = () => {
    setMobileChatActive(false);
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation) return;

    const other = otherUser(activeConversation);
    if (!other?.id) return;

    const payload = {
      receiver_id: other.id,
      message: text,
    };

    setText("");

    try {
      const response = await sendMessageApi("api/messages/send", payload);

      if (response && response.success && response.message) {
        dispatch(setMessages([...messages, response.message]));
      } else {
        fetchMessages(other.id);
      }

      refetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const groupedMessages = messages.reduce((groups, msg, idx) => {
    const dateKey = msg.created_at
      ? new Date(msg.created_at).toDateString()
      : "Unknown";
    if (!groups.length || groups[groups.length - 1].dateKey !== dateKey) {
      groups.push({
        dateKey,
        label: formatDate(msg.created_at),
        messages: [{ ...msg, _idx: idx }],
      });
    } else {
      groups[groups.length - 1].messages.push({ ...msg, _idx: idx });
    }
    return groups;
  }, []);

  const filteredConvs = (conversations || []).filter((conv) => {
    const name = conv?.user?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const allUsers = useMemo(() => {
    let res = usersData;
    if (!res) return [];

    let list = [];
    if (Array.isArray(res)) list = res;
    else if (Array.isArray(res.guards)) list = res.guards;
    else if (res.data && Array.isArray(res.data.guards)) list = res.data.guards;
    else if (Array.isArray(res.data)) list = res.data;
    else if (res.data && Array.isArray(res.data.data)) list = res.data.data;

    return list;
  }, [usersData]);

  const filteredUsers = allUsers.filter((u) => {
    const name = u?.name || u?.data?.name || "";
    const email = u?.email || u?.data?.email || "";
    return (
      name.toLowerCase().includes(userSearch.toLowerCase()) ||
      email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  const otherUser = (conv) => conv?.user || {};

  return (
    <div className="dashboard-main chat-room-premium">
      {/* Premium styles */}
      <style>{`
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --teal-tint: #f0fdf9;
          --teal-border: #d1fae5;
          --amber: #d97706;
          --success: #16a34a;
          --danger: #dc2626;
          --ink: #0f172a;
          --slate: #1e293b;
          --muted: #64748b;
          --faint: #94a3b8;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
          --canvas: #f8fafc;
        }

        .chat-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 28px 32px 42px;
          margin-bottom: 2rem;
          overflow: hidden;
          isolation: isolate;
        }
        .chat-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .chat-hero::after {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
        }
        .chat-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #6ee7d8;
          margin-bottom: 10px;
        }
        .chat-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .chat-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .chat-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        /* Layout */
        .chatroom-page {
          display: flex;
          gap: 16px;
          height: calc(100vh - 240px);
          min-height: 500px;
        }

        .chatroom-sidebar {
          width: 340px;
          flex-shrink: 0;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          border: 1px solid var(--line-soft);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chatroom-sidebar-header {
          background: #f9fafb;
          border-bottom: 1px solid var(--line-soft);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chatroom-plus-btn {
          width: 36px; height: 36px;
          border-radius: 10px !important;
          background: var(--teal) !important;
          color: #fff !important;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          box-shadow: 0 4px 10px rgba(10,124,110,0.3);
        }

        .chatroom-user-picker {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 10;
          width: 280px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(0,0,0,0.18);
          border: 1px solid var(--line);
          overflow: hidden;
        }

        .chatroom-conv-list {
          flex: 1;
          overflow-y: auto;
        }
        .chatroom-conv-item {
          cursor: pointer;
          transition: background 0.15s;
        }
        .chatroom-conv-item:hover {
          background: rgba(248,250,252,0.6);
        }
        .chatroom-conv-active {
          background: rgba(10,124,110,0.08);
          border-left: 3px solid var(--teal);
        }

        .chatroom-main {
          flex: 1;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          border: 1px solid var(--line-soft);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chatroom-main-header {
          background: #f9fafb;
          border-bottom: 1px solid var(--line-soft);
          padding: 14px 20px;
          display: flex;
          align-items: center;
        }

        .chatroom-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #fafbfc;
        }

        .message-bubble {
          max-width: 75%;
          padding: 10px 16px;
          border-radius: 18px;
          font-size: 0.9rem;
          position: relative;
          word-wrap: break-word;
        }
        .message-sent {
          background: var(--teal);
          color: #fff;
          border-bottom-right-radius: 4px;
          margin-left: auto;
        }
        .message-received {
          background: #fff;
          border: 1px solid var(--line);
          border-bottom-left-radius: 4px;
        }
        .chat-timestamp {
          font-size: 0.65rem;
          margin-top: 4px;
        }
        .chat-date-separator {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted);
          margin: 20px 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chatroom-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--line-soft);
          background: #fff;
        }
        .chatroom-send-btn {
          width: 38px; height: 38px;
          background: var(--teal) !important;
          border: none;
          box-shadow: 0 4px 10px rgba(10,124,110,0.3);
        }

        .chatroom-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }
        .chatroom-empty-icon {
          width: 80px; height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--navy-950), var(--navy-900));
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        @media (max-width: 767.98px) {
          .chatroom-page {
            flex-direction: column;
            height: auto;
            min-height: calc(100vh - 160px);
          }
          .chatroom-sidebar {
            width: 100%;
            border-radius: 18px 18px 0 0;
          }
          .chatroom-main {
            border-radius: 0 0 18px 18px;
          }
          .mobile-back-btn {
            display: inline-flex !important;
            margin-right: 8px;
          }
        }
        .mobile-back-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(10,124,110,0.1);
          border: none;
          color: var(--teal);
        }
      `}</style>

      {/* Hero Header */}
      <div className="chat-hero">
        <span className="chat-hero-eyebrow">
          <span className="dot"></span> Live Chat
        </span>
        <h1>{CATEGORY_LABELS[category] || "Communications"}</h1>
        <p style={{ textTransform: 'none' }}>Manage conversations, start calls, and keep communication in one place.</p>
      </div>

      <div className="chatroom-page">
        {/* ── LEFT PANEL (Sidebar) ── */}
        <div className={`chatroom-sidebar ${mobileChatActive ? 'd-none' : ''} d-md-flex`}>
          {/* Sidebar header */}
          <div className="chatroom-sidebar-header">
            <Avatar
              src={getProfileImageUrlFromUserdata(currentUser)}
              name={currentUser?.name || "Me"}
              size={40}
            />
            <span className="fw-semibold ms-2 flex-grow-1 text-truncate">
              {currentUser?.name || "Me"}
            </span>
            <div className="position-relative" ref={pickerRef}>
              <button
                className="chatroom-plus-btn"
                title={`New ${CATEGORY_LABELS[category] || ""} chat`}
                onClick={() => {
                  setShowUserPicker((v) => !v);
                  setUserSearch("");
                }}
              >
                <i className="fa-solid fa-plus"></i>
              </button>

              {/* User picker dropdown */}
              {showUserPicker && (
                <div className="chatroom-user-picker shadow">
                  <div className="p-2 border-bottom">
                    <input
                      className="form-control form-control-sm"
                      placeholder={`Search ${userType === "admin" ? CATEGORY_LABELS[category] : "admins"}…`}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="chatroom-user-picker-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {loadingUsers ? (
                      <div className="p-3 text-center text-muted small">Loading…</div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-3 text-center text-muted small">No users found</div>
                    ) : (
                      filteredUsers.map((u) => {
                        const uData = u?.data || u;
                        return (
                          <div
                            key={uData.id}
                            className="chatroom-user-picker-item d-flex align-items-center px-3 py-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleStartConversation(uData)}
                          >
                            <Avatar
                              src={getProfileImageUrlFromUserdata(uData)}
                              name={uData?.name}
                              size={34}
                            />
                            <div className="ms-2 overflow-hidden">
                              <div className="small fw-semibold text-truncate">
                                {uData?.name}
                              </div>
                              <div
                                className="text-muted text-truncate"
                                style={{ fontSize: "0.72rem", textTransform: "none" }}
                              >
                                {uData?.email}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <input
              className="form-control form-control-sm bg-light border-0 rounded-3"
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Conversation list */}
          <div className="chatroom-conv-list">
            {loadingConv ? (
              <div className="p-3 text-center text-muted small">Loading…</div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-4 text-center text-muted small" style={{ textTransform: "none" }}>
                No conversations yet. Press <strong>+</strong> to start one.
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const other = otherUser(conv);
                const isActive = activeConversation?.user?.id === other?.id;
                const hasUnread = conv.unread_count > 0;
                const lastMsgText = conv.last_message?.message || "";
                const lastMsgTime = conv.last_message?.created_at || null;
                const isSentByMe = conv.last_message?.is_sent_by_me || false;

                return (
                  <div
                    key={other?.id}
                    className={`chatroom-conv-item d-flex align-items-center px-3 py-2 ${isActive ? "chatroom-conv-active" : ""}`}
                    onClick={() => handleSelectConv(conv)}
                  >
                    <Avatar
                      src={getProfileImageUrlFromUserdata(other)}
                      name={other?.name}
                      size={40}
                    />
                    <div className="ms-2 flex-grow-1 overflow-hidden">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`small text-truncate ${hasUnread ? "fw-bold" : "fw-semibold"}`}>
                          {other?.name || "Unknown"}
                        </span>
                        <span className="text-muted" style={{ fontSize: "0.68rem", flexShrink: 0 }}>
                          {formatTime(lastMsgTime)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <div className={`text-truncate ${hasUnread ? "text-dark fw-bold" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
                          {isSentByMe && lastMsgText && <span className="me-1">You:</span>}
                          {lastMsgText}
                        </div>
                        {hasUnread && (
                          <span className="badge bg-danger rounded-pill ms-1" style={{ fontSize: "0.65rem" }}>
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL (Chat main) ── */}
        <div className={`chatroom-main ${!mobileChatActive ? 'd-none' : ''} d-md-flex`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="chatroom-main-header">
                <button
                  className="mobile-back-btn"
                  onClick={handleBackToList}
                  title="Back to conversations"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <Avatar
                  src={getProfileImageUrlFromUserdata(otherUser(activeConversation))}
                  name={otherUser(activeConversation)?.name}
                  size={40}
                />
                <div className="ms-3">
                  <h6 className="mb-0 fw-bold" style={{ color: "#1a1a2e", fontSize: "0.97rem" }}>
                    {otherUser(activeConversation)?.name || "Conversation"}
                  </h6>
                </div>
              </div>

              {/* Messages */}
              <div className="chatroom-messages">
                {loadingMessages ? (
                  <div className="text-center text-muted py-5">
                    <i className="fa fa-spinner fa-spin fa-2x mb-3" style={{ color: "#0A7C6E" }}></i>
                    <p className="small mb-0">Loading messages…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(10,124,110,0.08)" }}
                    >
                      <i className="fa-regular fa-comment-dots fa-2x" style={{ color: "#0A7C6E" }}></i>
                    </div>
                    <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.dateKey}>
                      <div className="chat-date-separator">{group.label}</div>
                      {group.messages.map((m) => {
                        const isMe =
                          m.sender_id === user?.id ||
                          m.sender_id === currentUser?.id;
                        return (
                          <div
                            key={m._idx}
                            className={`d-flex mb-3 align-items-end gap-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                          >
                            {!isMe && (
                              <Avatar
                                src={getProfileImageUrlFromUserdata(otherUser(activeConversation))}
                                name={otherUser(activeConversation)?.name}
                                size={28}
                              />
                            )}
                            <div className={`message-bubble ${isMe ? "message-sent" : "message-received"} position-relative`}>
                              {isMe && (
                                <button
                                  onClick={() => askDeleteMessage(m)}
                                  className="btn btn-sm btn-link text-white p-0 position-absolute"
                                  style={{ top: "-10px", left: "-20px", opacity: 0.6 }}
                                  title="Delete message"
                                >
                                  <i className="fa-solid fa-trash" style={{ fontSize: "0.75rem", color: "#dc3545" }}></i>
                                </button>
                              )}
                              {m.message}
                              <div className={`chat-timestamp text-end ${isMe ? "text-white-50" : "text-muted"}`}>
                                {formatTime(m.created_at)}
                                {isMe && m.is_read && (
                                  <i className="fa-solid fa-check-double ms-1" style={{ fontSize: "0.6rem", color: "#4dffb5" }}></i>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>

              {/* Footer Input */}
              <div className="chatroom-footer">
                <form onSubmit={onSend} className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control border-0 bg-light rounded-pill"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button
                    className="chatroom-send-btn btn rounded-circle"
                    type="submit"
                    disabled={sending || !text.trim()}
                    title="Send"
                  >
                    {sending ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-paper-plane"></i>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="chatroom-empty-state">
              <div className="chatroom-empty-icon">
                <i className="fa-regular fa-comments" style={{ fontSize: 38, color: "#fff" }}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
                No Conversation Selected
              </h6>
              <p className="text-muted small text-center mb-0" style={{ maxWidth: 260, textTransform: "none" }}>
                Pick a conversation from the left, or press <strong>+</strong> to start a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMessageToDelete(null);
        }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(220,53,69,0.12)",
            }}
          >
            <i className="fa-solid fa-trash" style={{ color: "#dc3545", fontSize: "1.1rem" }}></i>
          </div>

          <h6 className="fw-bold mb-2">Delete this message?</h6>
          <p className="text-muted small mb-3" style={{ lineHeight: 1.45 }}>
            This action cannot be undone.
            {messageToDelete?.message ? (
              <>
                <br />
                <span className="d-inline-block mt-2 px-2 py-1 rounded bg-light text-dark">
                  "{String(messageToDelete.message).slice(0, 80)}"
                </span>
              </>
            ) : null}
          </p>

          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={() => {
                setShowDeleteModal(false);
                setMessageToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger px-3"
              onClick={handleDeleteMessage}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatRoom;