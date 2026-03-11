import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/chat.css";

const CATEGORIES = [
  { key: "admins", label: "Admins" },
  { key: "staff", label: "Staff" },
  { key: "customers", label: "Customers" },
  { key: "contractors", label: "Contractors" },
];

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="chat-landing-header mb-4">
        <h3 className="fw-bold mb-0">Chats</h3>
      </div>
      <div className="row g-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="col-12 col-sm-6 col-lg-3">
            <div className="chat-category-card">
              <div className="chat-category-icon-wrapper">
                <img
                  src="/assets/images/chat-category.svg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  alt=""
                  className="chat-category-img"
                />
                <div className="chat-category-placeholder">
                  <i className="fa-solid fa-comments fa-3x text-white opacity-75"></i>
                </div>
              </div>
              <div className="chat-category-body">
                <h5 className="fw-bold mb-3">{cat.label}</h5>
                <button
                  className="btn btn-dark px-4 py-2 rounded-3"
                  onClick={() => navigate(`/chat/${cat.key}`)}
                >
                  Access Now
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
