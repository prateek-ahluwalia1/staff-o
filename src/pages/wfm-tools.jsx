import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import leaveimg from "../assets/images/leave.png";
import publicHolidayImg from "../assets/images/public-holiday.png";
import staffoostaffimg from "../assets/images/capital-security-staff.png";

const WFMTools = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

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

        .wfm-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 2rem;
        }
        .wfm-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .wfm-hero::after {
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
        .wfm-hero-eyebrow {
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
        .wfm-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .wfm-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .wfm-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        .wfm-empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: #fff;
          border-radius: 18px;
          border: 1px solid var(--line-soft);
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          color: var(--muted);
          font-size: 0.95rem;
        }
        .wfm-empty-state i {
          font-size: 1.8rem;
          margin-right: 0.5rem;
          vertical-align: middle;
          color: var(--teal);
        }

        @media (max-width: 767.98px) {
          .wfm-hero { padding: 26px 20px 40px; border-radius: 18px; }
          .wfm-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero header */}
      <div className="wfm-hero">
        <span className="wfm-hero-eyebrow">
          <span className="dot"></span> Tools
        </span>
        <h1>WFM Tools</h1>
        <p style={{ textTransform: "none" }}>
          Leave tools and registered staff are managed here.
        </p>
      </div>

      {isAdmin ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
          <div className="col">
            <Card
              title="Leave Management"
              description="Used to display the detailed overview of staff leave requests."
              accent="linear-gradient(135deg, #16a34a, #22c55e)"
              image={leaveimg}
              type="leave"
              onClick={() => navigate("/leave")}
            />
          </div>
          <div className="col">
            <Card
              title="Public Holidays"
              description="Used to display the detailed overview of public holidays."
              accent="linear-gradient(135deg, #d97706, #f59e0b)"
              image={publicHolidayImg}
              type="holidays"
              onClick={() => navigate("/holidays")}
            />
          </div>
          <div className="col">
            <Card
              title="Staffoo Staff"
              description="Used to display the detailed overview of staff members."
              accent="linear-gradient(135deg, #0ea5e9, #38bdf8)"
              image={staffoostaffimg}
              type="staff"
              onClick={() => navigate("/staff-management")}
            />
          </div>
        </div>
      ) : (
        <div className="wfm-empty-state">
          <i className="fa fa-info-circle"></i>
          Leave management is currently available for admin users only.
        </div>
      )}
    </div>
  );
};

export default WFMTools;