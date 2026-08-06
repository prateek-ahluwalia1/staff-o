import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import payrateimg from "../assets/images/pay.png";
import chargerateimg from "../assets/images/charge.png";
import invoiceimg from "../assets/images/invoice.png";
import payslipimg from "../assets/images/pay-slip.png";
import contractorimg from "../assets/images/contractor-rates.png";

const PayChargerate = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

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

        .rates-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 2rem;
        }
        .rates-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .rates-hero::after {
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
        .rates-hero-eyebrow {
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
        .rates-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .rates-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .rates-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        @media (max-width: 767.98px) {
          .rates-hero { padding: 26px 20px 40px; border-radius: 18px; }
          .rates-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero header */}
      <div className="rates-hero">
        <span className="rates-hero-eyebrow">
          <span className="dot"></span> Finance
        </span>
        <h1>Rates Management</h1>
        <p style={{ textTransform: "none" }}>
          Choose a category to manage your rates.
        </p>
      </div>

      {/* Cards grid – 4 columns on XL */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
        {userType === "admin" && (
          <>
            <div className="col">
              <Card
                title="Charge Rates"
                description="Amount charged from customers."
                accent="linear-gradient(135deg, #16a34a, #22c55e)"
                image={chargerateimg}
                type="charge"
                onClick={() =>
                  navigate("/rates/charge", { state: { rateType: "charge" } })
                }
              />
            </div>
            <div className="col">
              <Card
                title="Pay Rates"
                description="Amount paid to the staff."
                accent="linear-gradient(135deg, #0ea5e9, #38bdf8)"
                image={payrateimg}
                type="pay"
                onClick={() =>
                  navigate("/rates/pay", { state: { rateType: "pay" } })
                }
              />
            </div>
            <div className="col">
              <Card
                title="Contractor Charge Rates"
                description="It is used to manage contractor charge rates"
                accent="linear-gradient(135deg, #8b5cf6, #a78bfa)"
                image={contractorimg}
                type="contractor rates"
                onClick={() => navigate("/rates/contractor")}
              />
            </div>
          </>
        )}

        <div className="col">
          <Card
            title="Invoice"
            description="It is used to send an invoice to the users"
            accent="linear-gradient(135deg, #d97706, #f59e0b)"
            image={invoiceimg}
            type="invoice"
            onClick={() => navigate("/accounts/invoice")}
          />
        </div>

        <div className="col">
          <Card
            title="Pay Slip"
            description="It is used to generate a pay slip"
            accent="linear-gradient(135deg, #8b5cf6, #a78bfa)"
            image={payslipimg}
            type="pay-slip"
            onClick={() => navigate("/pay-slip")}
          />
        </div>
      </div>
    </div>
  );
};

export default PayChargerate;