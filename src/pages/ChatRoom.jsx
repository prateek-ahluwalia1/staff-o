import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  setConversations,
  setActiveChat,
  setMessages,
  setActiveCategory,
  prependConversation,
} from "../store/slices/chatSlice";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { apiURL } from "../utils/exports";
import "../assets/css/chat.css";

// Map route param -> API endpoint for fetching users
const USER_ENDPOINTS = {
  admins: "api/admin/get-users?role=admin&limit=500",
  staff: "api/admin/get-staff?limit=500",
  customers: "api/admin/get-customers?limit=500",
  contractors: "api/admin/get-contractors?limit=500",
};

// Map route param -> display label
const CATEGORY_LABELS = {
  admins: "Admins",
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
  const { user, userdata, token } = useSelector((state) => state.auth);
  const { conversations, activeConversation, messages } = useSelector(
    (state) => state.chat,
  );

  const currentUser = userdata?.data || userdata || {};

  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef();
  const pickerRef = useRef();

  // Fetch conversations for this category
  const { data: convData, loading: loadingConv } = useFetch(
    `chat/conversations?type=${category}`,
    { isAuth: true },
  );

  // Fetch users for the + picker (endpoint is null when picker is closed)
  const userEndpoint = USER_ENDPOINTS[category];
  const { data: usersData, loading: loadingUsers } = useFetch(
    showUserPicker && userEndpoint ? userEndpoint : null,
    { isAuth: true },
  );

  const { submit: sendMessageApi, loading: sending } = useSubmit({
    isAuth: true,
  });
  const { submit: startConversation } = useSubmit({ isAuth: true });

  // Set active category on mount / category change
  useEffect(() => {
    dispatch(setActiveCategory(category));
  }, [category, dispatch]);

  // Load conversations when data arrives
  useEffect(() => {
    if (convData) {
      const list = convData?.data || convData || [];
      dispatch(setConversations(Array.isArray(list) ? list : []));
    }
  }, [convData, dispatch]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close picker on outside click
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
    async (convId) => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`${apiURL}chat/messages/${convId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        dispatch(setMessages(data?.data || data || []));
      } catch {
        // ignore
      } finally {
        setLoadingMessages(false);
      }
    },
    [token, dispatch],
  );

  const handleSelectConv = (conv) => {
    dispatch(setActiveChat(conv));
    fetchMessages(conv.id);
  };

  const handleStartConversation = async (targetUser) => {
    setShowUserPicker(false);
    const res = await startConversation("chat/conversations", {
      user_id: targetUser.id,
    });
    if (res) {
      const conv = res?.data || res;
      dispatch(prependConversation(conv));
      dispatch(setActiveChat(conv));
      fetchMessages(conv.id);
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation) return;
    const payload = { conversation_id: activeConversation.id, message: text };
    setText("");
    await sendMessageApi("chat/send", payload);
    // Re-fetch messages after send
    fetchMessages(activeConversation.id);
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filter conversations by search
  const filteredConvs = (conversations || []).filter((conv) => {
    const name = conv?.user?.name || conv?.other_user?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Users for picker
  const allUsers = usersData?.data?.data || usersData?.data || usersData || [];
  const filteredUsers = (Array.isArray(allUsers) ? allUsers : []).filter(
    (u) => {
      const name = u?.name || u?.data?.name || "";
      const email = u?.email || u?.data?.email || "";
      return (
        name.toLowerCase().includes(userSearch.toLowerCase()) ||
        email.toLowerCase().includes(userSearch.toLowerCase())
      );
    },
  );

  const otherUser = (conv) => conv?.user || conv?.other_user || {};

  return (
    <div className="chatroom-page">
      {/* ── LEFT PANEL ── */}
      <div className="chatroom-sidebar">
        {/* Header row: current user avatar + name + plus button */}
        <div className="chatroom-sidebar-header">
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
              const isActive = activeConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
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
                      <span className="small fw-semibold text-truncate">
                        {other?.name || "Unknown"}
                      </span>
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.68rem", flexShrink: 0 }}
                      >
                        {formatTime(conv.updated_at)}
                      </span>
                    </div>
                    <div
                      className="text-muted text-truncate"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {conv.last_message || ""}
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
            <div className="chatroom-main-header d-flex align-items-center px-4 py-3">
              <Avatar
                src={
                  otherUser(activeConversation)?.avatar ||
                  otherUser(activeConversation)?.profile_image
                }
                name={otherUser(activeConversation)?.name}
                size={38}
              />
              <h6 className="mb-0 fw-semibold ms-3">
                {otherUser(activeConversation)?.name || "Conversation"}
              </h6>
            </div>

            {/* Messages */}
            <div className="chatroom-messages flex-grow-1 overflow-auto p-4">
              {loadingMessages ? (
                <div className="text-center text-muted py-4">Loading…</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted py-4 small">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe =
                    m.sender_id === user?.id || m.sender_id === currentUser?.id;
                  return (
                    <div
                      key={i}
                      className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div
                        className={`message-bubble shadow-sm ${isMe ? "message-sent" : "message-received"}`}
                      >
                        {m.message}
                        <div
                          className={`chat-timestamp text-end ${isMe ? "text-white-50" : "text-muted"}`}
                        >
                          {formatTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* Footer Input */}
            <div className="chatroom-footer px-3 py-2 border-top">
              <form
                onSubmit={onSend}
                className="d-flex align-items-center gap-2"
              >
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-circle"
                  title="Attach file"
                >
                  <i className="fa-solid fa-paperclip"></i>
                </button>
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
          <div className="m-auto text-center px-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
              style={{
                width: 80,
                height: 80,
                background: "rgba(108,99,255,0.1)",
              }}
            >
              <i
                className="fa-regular fa-comments"
                style={{ fontSize: 36, color: "#6c63ff" }}
              ></i>
            </div>
            <p className="text-muted">
              Select a conversation or start a new chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
