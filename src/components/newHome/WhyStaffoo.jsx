import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function WhyStaffoo() {
  const { token } = useSelector((state) => state?.auth || {});
  const postJobRoute = token ? "/edit-profile" : "/register";
  const findJobRoute = token ? "/edit-profile" : "/login";

  return (
    <section className="whystaffoo-section split">
      <style>{`
        .whystaffoo-section {
          /* Home page exact color tokens & palette */
          --ws-green: var(--nh-green, #0A7C6E);
          --ws-green-dark: var(--nh-green-dark, #075E53);
          --ws-green-pale: var(--nh-green-light, #E1F3F0);
          --ws-green-accent: #33B9A8;
          --ws-amber: var(--nh-amber, #E2A33D);
          --ws-amber-pale: rgba(226, 163, 61, 0.16);
          --ws-amber-border: rgba(226, 163, 61, 0.32);
          --ws-ink: var(--nh-ink, #14181C);
          --ws-card: #1B2126;
          --ws-card-border: rgba(255, 255, 255, 0.09);
          --ws-white: #ffffff;
          --ws-text: #ffffff;
          --ws-muted: #AAB3AE;
          --ws-sub: #8D9A92;
          --ws-line: rgba(255, 255, 255, 0.08);
          --ws-radius-lg: 20px;
          --ws-radius-md: 14px;
          --ws-radius-sm: 999px;

          background: var(--ws-ink);
          padding: 80px 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          color: var(--ws-text);
          position: relative;
        }

        .whystaffoo-section * {
          box-sizing: border-box;
        }

        .whystaffoo-section .wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .whystaffoo-section .split-head {
          text-align: center;
          max-width: 640px;
          margin: 0 auto 48px;
        }

        .whystaffoo-section .eyebrow {
          color: var(--ws-green-accent);
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .whystaffoo-section .split-head h2 {
          color: var(--ws-white);
          font-family: 'Barlow Semi Condensed', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 38px;
          font-weight: 700;
          margin: 0 0 14px;
          letter-spacing: 0.01em;
          line-height: 1.15;
        }

        .whystaffoo-section .split-head p {
          color: var(--ws-muted);
          font-family: 'Inter', sans-serif;
          font-size: 16.5px;
          margin: 0;
          line-height: 1.55;
        }

        .whystaffoo-section .split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: stretch;
        }

        .whystaffoo-section .split-card {
          background: var(--ws-card);
          border: 1px solid var(--ws-card-border);
          border-radius: var(--ws-radius-lg);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .whystaffoo-section .role-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: var(--ws-radius-sm);
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 20px;
          width: fit-content;
        }

        .whystaffoo-section .role-pill.client {
          background: var(--ws-green-pale);
          color: var(--ws-green-dark);
        }

        .whystaffoo-section .role-pill.staff {
          background: var(--ws-amber-pale);
          color: var(--ws-amber);
          border: 1px solid var(--ws-amber-border);
        }

        .whystaffoo-section .split-card h3 {
          color: var(--ws-white);
          font-family: 'Barlow Semi Condensed', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 8px;
          line-height: 1.25;
          letter-spacing: 0.01em;
        }

        .whystaffoo-section .split-card .sub {
          color: var(--ws-sub);
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          margin: 0 0 28px;
          line-height: 1.45;
        }

        .whystaffoo-section .feature-list {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
        }

        .whystaffoo-section .feature-row {
          display: grid;
          grid-template-columns: 175px 1fr;
          gap: 20px;
          padding: 16px 0;
          border-top: 1px solid var(--ws-line);
        }

        .whystaffoo-section .feature-row:first-child {
          border-top: none;
          padding-top: 0;
        }

        .whystaffoo-section .feature-row dt {
          color: var(--ws-white);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          line-height: 1.4;
        }

        .whystaffoo-section .feature-row dd {
          color: var(--ws-muted);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .whystaffoo-section .split-card .btn {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 22px;
          border-radius: var(--ws-radius-sm);
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          background: var(--ws-green);
          color: var(--ws-white);
          border: 2px solid var(--ws-green);
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
          cursor: pointer;
        }

        .whystaffoo-section .split-card .btn:hover {
          background: var(--ws-green-dark);
          border-color: var(--ws-green-dark);
          color: var(--ws-white);
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .whystaffoo-section {
            padding: 60px 0;
          }
          .whystaffoo-section .split-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .whystaffoo-section .split-head h2 {
            font-size: 30px;
          }
        }

        @media (max-width: 600px) {
          .whystaffoo-section .wrap {
            padding: 0 20px;
          }
          .whystaffoo-section .split-card {
            padding: 28px 22px;
          }
          .whystaffoo-section .feature-row {
            grid-template-columns: 1fr;
            gap: 6px;
          }
        }
      `}</style>

      <div className="wrap">
        <div className="split-head">
          <div className="eyebrow">Two sides, one platform</div>
          <h2>What you get on Staffoo</h2>
          <p>Whether you are hiring or looking for work, this is exactly what is waiting for you.</p>
        </div>

        <div className="split-grid">
          {/* CLIENT CARD */}
          <div className="split-card">
            <span className="role-pill client">CLIENT</span>
            <h3>Hire staff you can verify</h3>
            <p className="sub">For individuals, businesses, and agencies alike.</p>
            <dl className="feature-list">
              <div className="feature-row">
                <dt>Post a job in 2 minutes</dt>
                <dd>One job or an ongoing roster. Describe what you need and go live straight away.</dd>
              </div>
              <div className="feature-row">
                <dt>See real license status</dt>
                <dd>Every staff subclass is checked against the register, not self reported.</dd>
              </div>
              <div className="feature-row">
                <dt>Compare ratings and reviews</dt>
                <dd>See experience, ratings, and completed jobs before you decide who to confirm.</dd>
              </div>
              <div className="feature-row">
                <dt>Manage multiple sites</dt>
                <dd>Running more than one contract. Track them all from a single dashboard.</dd>
              </div>
              <div className="feature-row">
                <dt>Pay securely</dt>
                <dd>Funds are released once the job is confirmed complete.</dd>
              </div>
            </dl>
            <Link to={postJobRoute} className="btn">Post your first job</Link>
          </div>

          {/* STAFF CARD */}
          <div className="split-card">
            <span className="role-pill staff">STAFF</span>
            <h3>Find jobs that fit your license</h3>
            <p className="sub">For licensed staff looking for consistent work.</p>
            <dl className="feature-list">
              <div className="feature-row">
                <dt>Build a duty profile</dt>
                <dd>Licenses, experience, and ratings, all in one place.</dd>
              </div>
              <div className="feature-row">
                <dt>Get matched automatically</dt>
                <dd>Jobs are filtered to your license subclass and your location.</dd>
              </div>
              <div className="feature-row">
                <dt>No commission taken</dt>
                <dd>The rate posted by the client is exactly what you are paid.</dd>
              </div>
              <div className="feature-row">
                <dt>Apply in one tap</dt>
                <dd>No phone calls, no waiting on a callback to hear back.</dd>
              </div>
              <div className="feature-row">
                <dt>Paid every fortnight</dt>
                <dd>A reliable pay cycle, in line with standard Australian pay periods.</dd>
              </div>
            </dl>
            <Link to={findJobRoute} className="btn">Browse open jobs</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
