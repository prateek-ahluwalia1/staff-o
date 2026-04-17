import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";

const ALL_CATEGORIES = [
  {
    key: "staff",
    label: "Staff",
    desc: "Chat with your team members in real-time",
    accent: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  },
  {
    key: "customers",
    label: "Customers",
    desc: "Handle customer conversations",
    accent: "linear-gradient(135deg,#0ea5e9,#0284c7)",
  },
  {
    key: "contractors",
    label: "Contractors",
    desc: "Connect and collaborate with contractors",
    accent: "linear-gradient(135deg,#16a34a,#15803d)",
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
    <div className="dashboard-tools-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Communications</h1>
          <p>
          Select a category to start or continue a conversation
          </p>
        </div>
      </div>

      <div className="row g-4 dashboard-tools-grid">
        {allowedCategories.map((cat) => (
          <div key={cat.key} className="col-12 col-sm-6 col-xl-4">
            <Card
              title={cat.label}
              description={cat.desc}
              accent={cat.accent}
              type="chat"
              onClick={() => navigate(`/chat/${cat.key}`)}
            />
          </div>
        ))}
        {allowedCategories.length === 0 && (
          <div className="col-12">
            <div className="dashboard-tools-empty-state">
              <i className="fa fa-info-circle"></i>
              You do not have permission to view any chat categories.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
