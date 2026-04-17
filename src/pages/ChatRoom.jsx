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
} from "../store/slices/chatSlice";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useCallManager } from "../hooks/useCallManager";
import { apiURL } from "../utils/exports";
import Modal from "../components/Modal";
import "../assets/css/chat.css";

const CATEGORY_LABELS = {
  staff: "Staff",
  customers: "Customers",
  contractors: "Contractors",
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
        background: "#6c757d",
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
  const loggedInContractorId = userdata?.id || userdata?.data?.id || null;

  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const scrollRef = useRef();
  const pickerRef = useRef();

  // 1. Get Conversations API
  const {
    data: convData,
    loading: loadingConv,
    refetch: refetchConversations,
  } = useFetch(`api/messages/conversations`, { isAuth: true });

  // Dynamically Set Endpoint based on RBAC & Category
  let userEndpoint = null;
  if (showUserPicker) {
    if (category === "staff") {
      if (userType === "admin") userEndpoint = "api/admin/get-staff?limit=500";
      else if (userType === "contractor" && loggedInContractorId) {
        userEndpoint = `api/get-contractor-staff/${loggedInContractorId}`;
      }
    } else if (category === "customers") {
      if (["admin", "contractor"].includes(userType))
        userEndpoint = "api/admin/get-customers?limit=500";
    } else if (category === "contractors") {
      if (["admin", "customer", "staff"].includes(userType))
        userEndpoint = "api/admin/get-contractors?limit=500";
    }
  }

  const { data: usersData, loading: loadingUsers } = useFetch(userEndpoint, {
    isAuth: true,
  });

  const { submit: sendMessageApi, loading: sending } = useSubmit({
    isAuth: true,
  });
  const { initiateCall, isCalling, isCurrentlyInCall } = useCallManager();

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
          },
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
      refetchConversations();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // 4. Delete Message API
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
      const other = otherUser(activeConversation);
      if (other?.id) fetchMessages(other.id);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleSelectConv = (conv) => {
    dispatch(setActiveChat(conv));
    const other = otherUser(conv);
    if (other?.id) {
      fetchMessages(other.id);
      markMessagesAsRead(other.id);
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
  };

  const handleStartCall = () => {
    const target = otherUser(activeConversation);
    if (!target?.id) return;
    initiateCall({ id: target.id, name: target.name || "User" });
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

  // Parse available users with RBAC logic + array handling
  const allUsers = useMemo(() => {
    let res = usersData;
    if (!res) return [];

    let list = [];
    if (Array.isArray(res)) list = res;
    else if (Array.isArray(res.guards))
      list = res.guards; // Handle guards array fix
    else if (res.data && Array.isArray(res.data.guards)) list = res.data.guards;
    else if (Array.isArray(res.data)) list = res.data;
    else if (res.data && Array.isArray(res.data.data)) list = res.data.data;

    // Strict enforce: Staff can ONLY message their assigned Contractor
    if (category === "contractors" && userType === "staff") {
      const myContractorId =
        userdata?.contractor_id || userdata?.data?.contractor_id;
      if (myContractorId) {
        return list.filter(
          (c) => c.id.toString() === myContractorId.toString(),
        );
      }
    }

    return list;
  }, [usersData, category, userType, userdata]);

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
    <div className="dashboard-tools-page">
      <div className="dashboard-page-header">
        <div>
          <h1>{CATEGORY_LABELS[category] || "Communications"} Chat</h1>
          <p>Manage conversations, start calls, and keep communication in one place.</p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate("/chat")}
          >
            <i className="fa-solid fa-arrow-left me-2"></i>
            Back to Categories
          </button>
        </div>
      </div>

      <div className="chatroom-page">
      {/* ── LEFT PANEL ── */}
      <div className="chatroom-sidebar">
        {/* Header row */}
        <div className="chatroom-sidebar-header">
          <button
            className="btn btn-sm me-1 flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            title="Back to Chats"
            onClick={() => navigate("/chat")}
          >
            <i
              className="fa-solid fa-arrow-left"
              style={{ fontSize: "0.8rem" }}
            ></i>
          </button>
          <Avatar
            src={currentUser?.avatar || currentUser?.profile_image}
            name={currentUser?.name || "Me"}
            size={40}
          />
          <span className="chatroom-sidebar-username fw-semibold ms-2 flex-grow-1 text-truncate">
            {currentUser?.name || "Me"}
          </span>
          <div className="position-relative" ref={pickerRef}>
            <button
              className="btn btn-light btn-sm rounded-circle chatroom-plus-btn"
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
                    placeholder={`Search ${CATEGORY_LABELS[category] || "users"}…`}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="chatroom-user-picker-list">
                  {loadingUsers ? (
                    <div className="p-3 text-center text-muted small">
                      Loading…
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-3 text-center text-muted small">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const uData = u?.data || u;
                      return (
                        <div
                          key={uData.id}
                          className="chatroom-user-picker-item d-flex align-items-center px-3 py-2"
                          onClick={() => handleStartConversation(uData)}
                        >
                          <Avatar
                            src={uData?.avatar || uData?.profile_image}
                            name={uData?.name}
                            size={34}
                          />
                          <div className="ms-2 overflow-hidden">
                            <div className="small fw-semibold text-truncate">
                              {uData?.name}
                            </div>
                            <div
                              className="text-muted text-truncate"
                              style={{ fontSize: "0.72rem" }}
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
        <div className="chatroom-search px-3 py-2">
          <input
            className="form-control form-control-sm"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Conversation list */}
        <div className="chatroom-conv-list">
          {loadingConv ? (
            <div className="p-3 text-center text-muted small">Loading…</div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-4 text-center text-muted small">
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
                    src={other?.avatar || other?.profile_image}
                    name={other?.name}
                    size={40}
                  />
                  <div className="ms-2 flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className={`small text-truncate ${hasUnread ? "fw-bold" : "fw-semibold"}`}
                      >
                        {other?.name || "Unknown"}
                      </span>
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.68rem", flexShrink: 0 }}
                      >
                        {formatTime(lastMsgTime)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <div
                        className={`text-truncate ${hasUnread ? "text-dark fw-bold" : "text-muted"}`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {isSentByMe && lastMsgText && (
                          <span className="me-1">You:</span>
                        )}
                        {lastMsgText}
                      </div>
                      {hasUnread && (
                        <span
                          className="badge bg-danger rounded-pill ms-1"
                          style={{ fontSize: "0.65rem" }}
                        >
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

      {/* ── RIGHT PANEL ── */}
      <div className="chatroom-main">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="chatroom-main-header">
              <Avatar
                src={
                  otherUser(activeConversation)?.avatar ||
                  otherUser(activeConversation)?.profile_image
                }
                name={otherUser(activeConversation)?.name}
                size={40}
              />
              <div className="ms-3">
                <h6
                  className="mb-0 fw-bold"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#1a1a2e",
                    fontSize: "0.97rem",
                  }}
                >
                  {otherUser(activeConversation)?.name || "Conversation"}
                </h6>
              </div>
              <div className="ms-auto d-flex align-items-center">
                <button
                  type="button"
                  className="btn rounded-circle chatroom-call-btn"
                  onClick={handleStartCall}
                  disabled={isCalling || isCurrentlyInCall}
                  title={
                    isCurrentlyInCall
                      ? "You are already in an active call"
                      : "Start call"
                  }
                >
                  <i
                    className={
                      isCalling ? "fa fa-spinner fa-spin" : "fa-solid fa-phone"
                    }
                  ></i>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chatroom-messages">
              {loadingMessages ? (
                <div className="text-center text-muted py-5">
                  <i
                    className="fa fa-spinner fa-spin fa-2x mb-3"
                    style={{ color: "#263bd6" }}
                  ></i>
                  <p className="small mb-0">Loading messages…</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "rgba(38,59,214,0.08)",
                    }}
                  >
                    <i
                      className="fa-regular fa-comment-dots fa-2x"
                      style={{ color: "#263bd6" }}
                    ></i>
                  </div>
                  <p className="text-muted small mb-0">
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
                              src={
                                otherUser(activeConversation)?.avatar ||
                                otherUser(activeConversation)?.profile_image
                              }
                              name={otherUser(activeConversation)?.name}
                              size={28}
                            />
                          )}
                          <div
                            className={`message-bubble ${isMe ? "message-sent" : "message-received"} position-relative`}
                          >
                            {isMe && (
                              <button
                                onClick={() => askDeleteMessage(m)}
                                className="btn btn-sm btn-link text-white p-0 position-absolute"
                                style={{
                                  top: "-10px",
                                  left: "-20px",
                                  opacity: 0.6,
                                }}
                                title="Delete message"
                              >
                                <i
                                  className="fa-solid fa-trash"
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#dc3545",
                                  }}
                                ></i>
                              </button>
                            )}

                            {m.message}
                            <div
                              className={`chat-timestamp text-end ${isMe ? "text-white-50" : "text-muted"}`}
                            >
                              {formatTime(m.created_at)}
                              {isMe && m.is_read && (
                                <i
                                  className="fa-solid fa-check-double ms-1"
                                  style={{
                                    fontSize: "0.6rem",
                                    color: "#4dffb5",
                                  }}
                                ></i>
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
              <form
                onSubmit={onSend}
                className="d-flex align-items-center gap-2"
              >
                <input
                  type="text"
                  className="form-control border-0 bg-light rounded-pill"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-sm rounded-circle chatroom-send-btn"
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
              <i
                className="fa-regular fa-comments"
                style={{ fontSize: 38, color: "#263bd6" }}
              ></i>
            </div>
            <h6
              className="fw-bold mb-1"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1a2e" }}
            >
              No Conversation Selected
            </h6>
            <p
              className="text-muted small text-center mb-0"
              style={{ maxWidth: 260 }}
            >
              Pick a conversation from the left, or press <strong>+</strong> to
              start a new one.
            </p>
          </div>
        )}
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
            <i
              className="fa-solid fa-trash"
              style={{ color: "#dc3545", fontSize: "1.1rem" }}
            ></i>
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
    </div>
  );
};

export default ChatRoom;
