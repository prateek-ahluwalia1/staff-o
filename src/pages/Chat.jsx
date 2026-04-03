import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../assets/css/chat.css";

const ALL_CATEGORIES = [
  {
    key: "staff",
    label: "Staff",
    desc: "Chat with your team members in real-time",
    icon: "fa-solid fa-users",
  },
  {
    key: "customers",
    label: "Customers",
    desc: "Handle customer conversations",
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
  const { userdata } = useSelector((state) => state.auth);
  const userType =
    userdata?.user_type?.toLowerCase() ||
    userdata?.data?.user_type?.toLowerCase() ||
    "";

  // Apply Role-Based Access Control (RBAC) to visible categories
  const allowedCategories = useMemo(() => {
    switch (userType) {
      case "admin":
        return ALL_CATEGORIES; // Admins see all
      case "contractor":
        return ALL_CATEGORIES.filter(
          (c) => c.key === "staff" || c.key === "customers",
        );
      case "staff":
      case "customer":
        return ALL_CATEGORIES.filter((c) => c.key === "contractors"); // Staff & Customers only talk to Contractors
      default:
        return [];
    }
  }, [userType]);

  return (
    <div className="container py-4">
      <div className="chat-landing-header mb-4">
        <h3 className="fw-bold mb-1">Communications</h3>
        <p className="mb-0">
          Select a category to start or continue a conversation
        </p>
      </div>

      <div className="row g-4">
        {allowedCategories.map((cat) => (
          <div key={cat.key} className="col-12 col-sm-6 col-xl-4">
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
                  Access Now
                </button>
              </div>
            </div>
          </div>
        ))}
        {allowedCategories.length === 0 && (
          <div className="col-12 text-center text-muted mt-5">
            You do not have permission to view any chat categories.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
