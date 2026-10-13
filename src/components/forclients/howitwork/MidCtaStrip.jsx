import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import "../../../styles/staffoo.css";

export default function MidCtaStrip() {
  const { token } = useSelector((state) => state.auth);
  const postJobRoute = token ? "/dashboard" : "/register";

  return (
    <section className="stf-section mid-cta-section" style={{ background: "var(--tint)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "44px 0" }}>
      <div className="stf-wrap">
        <div className="mid-cta-card">
          <div className="mid-cta-content">
            <h3 className="mid-cta-title">
              Ready to try it on one shift?
            </h3>
            <p className="mid-cta-desc">
              Post a single job and see how fast it fills before committing to anything else.
            </p>
          </div>

          <div className="nh-hero-actions mid-cta-actions">
            <Link to={postJobRoute} className="nh-btn nh-btn-solid nh-btn-lg">
              Post a job
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .mid-cta-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border: 1.5px solid var(--green, #0A7C6E);
          background: var(--green-light, #E1F3F0);
          border-radius: var(--radius, 14px);
          padding: 26px 30px;
        }

        .mid-cta-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mid-cta-title {
          font-size: 21px;
          margin: 0 0 4px 0;
          font-family: 'Barlow Semi Condensed', sans-serif;
          font-weight: 600;
          color: var(--ink, #14181C);
          line-height: 1.25;
        }

        .mid-cta-desc {
          font-size: 13.5px;
          color: var(--green-dark, #075E53);
          margin: 0;
          line-height: 1.4;
        }

        .mid-cta-actions.nh-hero-actions {
          margin: 0 !important;
          margin-bottom: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mid-cta-actions .nh-btn {
          min-width: 170px !important;
          justify-content: center !important;
          text-align: center !important;
          margin: 0 !important;
        }

        @media (max-width: 768px) {
          .mid-cta-card {
            flex-direction: column;
            text-align: center;
            align-items: center;
            justify-content: center;
            gap: 18px;
            padding: 24px 20px;
          }

          .mid-cta-content {
            align-items: center;
            text-align: center;
          }

          .mid-cta-title {
            font-size: 20px;
          }

          .mid-cta-actions.nh-hero-actions {
            width: 100%;
            justify-content: center;
          }

          .mid-cta-actions .nh-btn {
            width: 100%;
            max-width: 260px;
          }
        }
      `}</style>
    </section>
  );
}

