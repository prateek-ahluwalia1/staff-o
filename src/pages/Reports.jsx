import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import reportimg from "../assets/images/reports.png";
import jobtrackingimg from "../assets/images/jobtracker.png";
import visaimg from "../assets/images/visa-check.png";
import paysheetimg from "../assets/images/pay-sheet.png";

const Reports = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

  if (userType !== "admin") {
    return (
      <div className="dashboard-main">
        <div className="text-center py-5 mt-5">
          <i className="fa-solid fa-lock fa-2x text-muted mb-3"></i>
          <h5 className="text-muted">Access Denied</h5>
          <p className="text-muted small" style={{ textTransform: "none" }}>
            You do not have permission to access reports management.
          </p>
        </div>
      </div>
    );
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

        .reports-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 2rem;
        }
        .reports-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .reports-hero::after {
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
        .reports-hero-eyebrow {
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
        .reports-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .reports-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .reports-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        @media (max-width: 767.98px) {
          .reports-hero { padding: 26px 20px 40px; border-radius: 18px; }
          .reports-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero header */}
      <div className="reports-hero">
        <span className="reports-hero-eyebrow">
          <span className="dot"></span> Admin
        </span>
        <h1>Reports Management</h1>
        <p style={{ textTransform: "none" }}>
          Choose a category to manage your reports.
        </p>
      </div>

      {/* Cards grid – 4 columns on XL */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
        <div className="col">
          <Card
            title="Time Sheet"
            description="Used to display the detailed overview of staff work hours."
            accent="linear-gradient(135deg, #16a34a, #22c55e)"
            image={reportimg}
            type="timesheet"
            onClick={() => navigate("/timesheet")}
          />
        </div>

        <div className="col">
          <Card
            title="Job Tracker"
            description="Used to display the detailed overview of staff job progress."
            accent="linear-gradient(135deg, #d97706, #f59e0b)"
            image={jobtrackingimg}
            type="jobtracker"
            onClick={() => navigate("/job-tracker")}
          />
        </div>

        <div className="col">
          <Card
            title="Visa Check"
            description="Run visa verification checks and view visa check results."
            accent="linear-gradient(135deg, #0ea5e9, #38bdf8)"
            image={visaimg}
            type="visacheck"
            onClick={() => navigate("/visa-management")}
          />
        </div>

        <div className="col">
          <Card
            title="Pay Sheet"
            description="View and manage staff pay sheet information."
            accent="linear-gradient(135deg, #8b5cf6, #a78bfa)"
            image={paysheetimg}
            type="paysheet"
            onClick={() => navigate("/pay-sheet")}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;