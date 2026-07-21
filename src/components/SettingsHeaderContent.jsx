import React from "react";

export default function SettingsHeaderContent({
  userType,
  name,
  email,
  city,
  company_name,
  profileCompletion = -1,
  isVerified,
  isActive,
}) {
  const pct = Math.min(100, Math.max(0, Number(profileCompletion) || 0));

  const limitToFirstFourWords = (text) => {
    if (!text) return "";
    return text.split(" ").slice(0, 4).join(" ");
  };

  // Progress circle dimensions (desktop)
  const radius = 38;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const getProgressColor = () => {
    if (pct === 0) return "#6b7280";
    if (pct < 40) return "#f87171";
    if (pct < 80) return "#fbbf24";
    return "#4ade80";
  };

  const verified = !!(
    isVerified === true ||
    isVerified === "true" ||
    isVerified === 1 ||
    isVerified === "1"
  );

  const isActiveProfile = !!(
    isActive === true ||
    isActive === "true" ||
    isActive === 1 ||
    isActive === "1"
  );

  const progressColor = getProgressColor();

  return (
    <div className="settings-header-wrapper d-flex align-items-center flex-wrap gap-4">
      <style>{`
        /* ---- Reset / base for this component only ---- */
        .settings-header-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          color: #fff;
        }

        /* Left block */
        .sh-left {
          flex: 1 1 320px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sh-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.2;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin: 0;
          color: #fff;
        }

        .sh-name {
          word-break: break-word;
        }

        .sh-subtitle {
          color: rgba(255,255,255,0.7);
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.5;
        }

        /* Meta pills */
        .sh-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }

        .sh-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          white-space: nowrap;
        }

        .sh-meta-item i {
          font-size: 0.85rem;
          opacity: 0.8;
          width: 16px;
          text-align: center;
        }

        .sh-meta-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 250px;
        }

        /* Status badge */
        .sh-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid;
          white-space: nowrap;
        }

        .sh-badge--active {
          background: rgba(22, 163, 74, 0.2);
          color: #bbf7d0;
          border-color: rgba(34, 197, 94, 0.5);
        }

        .sh-badge--inactive {
          background: rgba(220, 38, 38, 0.2);
          color: #fecaca;
          border-color: rgba(248, 113, 113, 0.5);
        }

        .sh-verified {
          color: #6ee7d8;
          font-size: 1.2rem;
        }

        /* Progress card */
        .sh-progress {
          flex: 0 0 auto;
          align-self: center;
        }

        .sh-progress-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .sh-progress-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.5);
        }

        .sh-progress-ring {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sh-progress-value {
          position: absolute;
          font-weight: 800;
          font-size: 1rem;
          color: #fff;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sh-title {
            font-size: 1.6rem;
          }
          .sh-subtitle {
            font-size: 0.85rem;
          }
          .sh-meta-item {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
          .sh-progress-card {
            flex-direction: row;
            gap: 12px;
            padding: 10px 16px;
            width: 100%;
            justify-content: center;
          }
          .sh-progress-ring {
            width: 70px;
            height: 70px;
          }
          .sh-progress-value {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 576px) {
          .sh-left {
            text-align: center;
            align-items: center;
          }
          .sh-meta {
            justify-content: center;
          }
          .sh-meta-item {
            width: 100%;
            justify-content: center;
          }
          .sh-meta-text {
            max-width: none;
          }
          .sh-title {
            justify-content: center;
            font-size: 1.4rem;
          }
        }
      `}</style>

      {/* Left side */}
      <div className="sh-left">
        <h1 className="sh-title">
          <span className="sh-name">{name || "Staff Member"}</span>
          {verified && (
            <i className="fa-solid fa-circle-check sh-verified" title="Verified Profile"></i>
          )}
          <span className={`sh-badge ${isActiveProfile ? "sh-badge--active" : "sh-badge--inactive"}`}>
            <i className={`fa-solid ${isActiveProfile ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
            {isActiveProfile ? "Active" : "Inactive"}
          </span>
        </h1>
        <p className="sh-subtitle">
          Keep your information up to date so your profile stays accurate and complete.
        </p>
        <div className="sh-meta">
          <span className="sh-meta-item">
            <i className="fa-solid fa-envelope"></i>
            <span className="sh-meta-text">{email || "No email"}</span>
          </span>
          {userType !== "contractor" ? (
            <span className="sh-meta-item">
              <i className="fa-solid fa-location-dot"></i>
              <span className="sh-meta-text">{limitToFirstFourWords(city) || "No location"}</span>
            </span>
          ) : (
            <span className="sh-meta-item">
              <i className="fa-solid fa-briefcase"></i>
              <span className="sh-meta-text">{company_name || "No company name"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right side: progress ring (only for staff / contractors, when incomplete) */}
      {userType !== "admin" && userType !== "customer" && pct > 0 && pct < 100 && (
        <div className="sh-progress">
          <div className="sh-progress-card">
            <span className="sh-progress-label d-none d-md-block">Completion</span>
            <div className="sh-progress-ring">
              {/* Desktop ring */}
              <svg height={radius * 2} width={radius * 2} className="d-none d-md-block">
                <circle
                  stroke="rgba(255,255,255,0.15)"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  stroke={progressColor}
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{
                    strokeDashoffset,
                    transition: "stroke-dashoffset 0.8s ease",
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                  }}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              {/* Mobile ring */}
              <svg viewBox="0 0 60 60" className="d-md-none" style={{ width: "100%", height: "100%" }}>
                <circle
                  stroke="rgba(255,255,255,0.15)"
                  fill="transparent"
                  strokeWidth="6"
                  r="25"
                  cx="30"
                  cy="30"
                />
                <circle
                  stroke={progressColor}
                  fill="transparent"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${50 * Math.PI} ${50 * Math.PI}`}
                  style={{
                    strokeDashoffset: (50 * Math.PI) - (pct / 100) * (50 * Math.PI),
                    transition: "stroke-dashoffset 0.8s ease",
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                  }}
                  r="25"
                  cx="30"
                  cy="30"
                />
              </svg>
              <div className="sh-progress-value">{pct}%</div>
            </div>
            <span className="sh-progress-label d-md-none">Completion</span>
          </div>
        </div>
      )}
    </div>
  );
}