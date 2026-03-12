import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/chat.css";

const CATEGORIES = [
  {
    key: "staff",
    label: "Staff",
    desc: "Chat with your team members in real-time",
    icon: "fa-solid fa-users",
  },
  {
    key: "customers",
    label: "Customers",
    desc: "Manage and respond to customer conversations",
    icon: "fa-solid fa-user-tie",
  },
  {
    key: "contractors",
    label: "Contractors",
    desc: "Connect and collaborate with contractors",
    icon: "fa-solid fa-helmet-safety",
  },
];

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <div className="chat-landing-header mb-4">
        <h3 className="fw-bold mb-1">Communications</h3>
        <p className="mb-0">
          Select a category to start or continue a conversation
        </p>
      </div>

      <div className="row g-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="col-12 col-sm-6 col-xl-3">
            <div className="chat-category-card">
              <div className="chat-category-icon-wrapper">
                <div className="chat-category-placeholder">
                  <div className="chat-category-icon-circle">
                    <i className={`${cat.icon} fa-2x text-white`}></i>
                  </div>
                  <span
                    className="text-white fw-semibold mt-1"
                    style={{
                      fontSize: "0.8rem",
                      opacity: 0.85,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {cat.label.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="chat-category-body">
                <h5>{cat.label}</h5>
                <p className="chat-cat-desc">{cat.desc}</p>
                <button
                  className="chat-category-btn"
                  onClick={() => navigate(`/chat/${cat.key}`)}
                >
                  <i className="fa-solid fa-arrow-right me-2"></i>Open Chat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
