import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import chat1img from "../assets/images/chat1.png";
import chat2img from "../assets/images/chat2.png";
import chat3img from "../assets/images/chat3.png";

const ALL_CATEGORIES = [
  {
    key: "staff",
    label: "Staff",
    desc: "Chat with your team members in real-time",
    accent: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    image: chat1img,
  },
  {
    key: "customers",
    label: "Customers",
    desc: "Handle customer conversations",
    accent: "linear-gradient(135deg,#0ea5e9,#0284c7)",
    image: chat2img,
  },
  {
    key: "contractors",
    label: "Contractors",
    desc: "Connect and collaborate with contractors",
    accent: "linear-gradient(135deg,#16a34a,#15803d)",
    image: chat3img,
  },
];

const Chat = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType =
    userdata?.user_type?.toLowerCase() ||
    userdata?.data?.user_type?.toLowerCase() ||
    "";

  useEffect(() => {
    if (userType && userType !== "admin") {
      navigate("/chat/admin", { replace: true });
    }
  }, [userType, navigate]);

  const allowedCategories = useMemo(() => {
    if (userType === "admin") {
      return ALL_CATEGORIES;
    }
    return [];
  }, [userType]);

  if (userType && userType !== "admin") {
    return null;
  }

  return (
    <div className="dashboard-tools-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Communications</h1>
          <p>Select a category to start or continue a conversation</p>
        </div>
      </div>

      <div className="row g-4 dashboard-tools-grid">
        {allowedCategories.map((cat) => (
          <div key={cat.key} className="col-12 col-sm-6 col-xl-4">
            <Card
              title={cat.label}
              description={cat.desc}
              accent={cat.accent}
              image={cat.image}
              type="chat"
              onClick={() => navigate(`/chat/${cat.key}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;