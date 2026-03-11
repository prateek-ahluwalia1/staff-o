import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setConversations,
  setActiveChat,
  setMessages,
} from "../store/slices/chatSlice";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import "../assets/css/chat.css";

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, activeConversation, messages } = useSelector(
    (state) => state.chat,
  );
  const [text, setText] = useState("");
  const scrollRef = useRef();

  // API Hooks
  const { data: convData, loading: loadingConv } = useFetch(
    "/chat/conversations",
    { isAuth: true },
  );
  const { submit: sendMessageApi, loading: sending } = useSubmit({
    isAuth: true,
  });

  // 1. Load sidebar conversations
  useEffect(() => {
    if (convData) dispatch(setConversations(convData));
  }, [convData, dispatch]);

  // 2. Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectChat = async (conv) => {
    dispatch(setActiveChat(conv));
    // Fetch individual messages when a chat is clicked
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/chat/messages/${conv.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      dispatch(setMessages(data));
    } catch (err) {
      console.error("Failed to load messages");
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation) return;

    const payload = { conversation_id: activeConversation.id, message: text };

    // Optimistic UI: You could dispatch addMessage here manually for instant feedback
    await sendMessageApi("/chat/send", payload);
    setText("");
  };

  return (
    <div className="container py-5">
      <div className="chat-app bg-white shadow-sm">
        <div className="row g-0 h-100">
          {/* SIDEBAR */}
          <div className="col-4 d-flex flex-column border-end h-100 chat-sidebar">
            <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Messages</h5>
            </div>
            <div className="flex-grow-1 overflow-auto">
              {loadingConv ? (
                <div className="p-3 text-center">Loading...</div>
              ) : (
                <div className="list-group list-group-flush">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectChat(conv)}
                      className={`list-group-item list-group-item-action p-3 ${activeConversation?.id === conv.id ? "active" : ""}`}
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            conv.user.avatar || "https://via.placeholder.com/40"
                          }
                          className="rounded-circle me-3"
                          alt="user"
                          width="40"
                          height="40"
                        />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex justify-content-between">
                            <h6 className="mb-0 text-truncate">
                              {conv.user.name}
                            </h6>
                            <small className="text-muted">12:45 PM</small>
                          </div>
                          <p className="small mb-0 text-truncate text-muted">
                            {conv.last_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CHAT MAIN WINDOW */}
          <div className="col-8 d-flex flex-column h-100 bg-white">
            {activeConversation ? (
              <>
                {/* Header */}
                <div className="p-3 border-bottom d-flex align-items-center bg-light">
                  <img
                    src={
                      activeConversation.user.avatar ||
                      "https://via.placeholder.com/40"
                    }
                    className="rounded-circle me-2"
                    width="35"
                    height="35"
                    alt=""
                  />
                  <h6 className="mb-0 fw-bold">
                    {activeConversation.user.name}
                  </h6>
                </div>

                {/* Messages Area */}
                <div className="flex-grow-1 p-4 overflow-auto chat-messages">
                  {messages.map((m, i) => {
                    const isMe = m.sender_id === user.id;
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
                            12:46 PM
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>

                {/* Footer Input */}
                <div className="p-3 border-top">
                  <form onSubmit={onSend} className="input-group">
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      placeholder="Type a message..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <button
                      className="btn btn-primary px-4"
                      type="submit"
                      disabled={sending}
                    >
                      {sending ? (
                        <i className="fa fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa fa-paper-plane"></i>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="m-auto text-center">
                <i className="fa fa-comments-o fa-4x text-light mb-3"></i>
                <h5 className="text-muted">
                  Select a conversation to start chatting
                </h5>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
