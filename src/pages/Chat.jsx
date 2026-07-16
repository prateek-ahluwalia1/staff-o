import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import chat1img from "../assets/images/chat1.png";
import chat2img from "../assets/images/chat2.png";
import chat3img from "../assets/images/chat3.png";
import inductionimg from "../assets/images/induction.png";

const ALL_CATEGORIES = [
  {
    key: "staff",
    label: "Staff",
    desc: "Chat with your team members in real-time",
    accent: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    image: chat1img,
  },
  {
    key: "customers",
    label: "Clients",
    desc: "Handle client conversations",
    accent: "linear-gradient(135deg, #16a34a, #22c55e)",
    image: chat2img,
  },
  {
    key: "contractors",
    label: "Resource Partners",
    desc: "Connect with Resource Partners",
    accent: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    image: chat3img,
  },
];

const Chat = () => {
  const navigate = useNavigate();

  const userdata = useSelector((state) => state.auth?.userdata);

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

  // For non-admins, we redirect before render, but keep a fallback empty state just in case
  if (userType && userType !== "admin") {
    return null; // redirect will happen in useEffect
  }

  return (
    <div className="dashboard-main">
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
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 2rem;
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

        @media (max-width: 767.98px) {
          .chat-hero { padding: 26px 20px 40px; border-radius: 18px; }
          .chat-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero header */}
      <div className="chat-hero">
        <span className="chat-hero-eyebrow">
          <span className="dot"></span> Connect
        </span>
        <h1>Communications</h1>
        <p style={{ textTransform: "none" }}>
          Select a category to start or continue a conversation
        </p>
      </div>

      {/* Cards grid – 4 columns on XL */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
        {allowedCategories.map((cat) => (
          <div key={cat.key} className="col">
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
        {userType === "admin" && (
          <div className="col">
            <Card
              title="Induction"
              description="Access induction materials and resources"
              accent="linear-gradient(135deg, #f59e0b, #fbbf24)"
              image={inductionimg}
              type="chat"
              onClick={() => navigate(`/induction`)}
            />
          </div>
        )}
      </div>

      {/* Fallback for non-admins (should not be rendered due to redirect) */}
      {userType && userType !== "admin" && (
        <div className="text-center py-5 mt-5">
          <i className="fa-solid fa-lock fa-2x text-muted mb-3"></i>
          <h5 className="text-muted">Access Denied</h5>
          <p className="text-muted small" style={{ textTransform: "none" }}>
            You do not have permission to access this page.
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;