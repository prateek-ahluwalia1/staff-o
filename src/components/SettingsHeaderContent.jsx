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
  avatar,
}) {
  const pct = Math.min(100, Math.max(0, Number(profileCompletion) || 0));

  const limitToFirstFourWords = (text) => {
    if (!text) return "";
    return text.split(" ").slice(0, 4).join(" ");
  };

  // Progress circle dimensions
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

  // Check if the user is both staff AND inactive
  const isStaffInactive = userType === "staff" && !isActiveProfile;


  const progressColor = getProgressColor();
  const showProgress =
    userType !== "admin" && userType !== "customer" && pct > 0 && pct < 100;

  // ---------- Progress ring sub‑component ----------
  const ProgressRing = () => (
    <div className="sh-progress-card">
      <span className="sh-progress-label sh-progress-label--top"
        style={{
          marginBottom: "0.2rem"
        }}
      >Completion</span>
      <div className="sh-progress-ring">
        <svg height={radius * 2} width={radius * 2}>
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
        <div className="sh-progress-value">{pct}%</div>
      </div>
      <span className="sh-progress-label sh-progress-label--bottom">
        Completion
      </span>
    </div>
  );

  return (
    <div className="settings-hero-content">
      <style>{`
        .settings-hero-content {
          color: #fff;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        /* ---- Desktop layout ---- */
        .sh-hero-inner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
          .sh-subtitle--danger {
          color: #f87171; /* Vibrant red for good contrast on dark background */
          font-weight: 600; /* Bolder to make it prominent */
        }
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

        .sh-left {
          flex: 1 1 320px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sh-avatar-desktop,
        .sh-progress-desktop {
          flex-shrink: 0;
        }

        /* ---- Mobile layout ---- */
        .sh-mobile-top {
          display: none;
        }

        @media (max-width: 768px) {
          .sh-hero-inner {
            flex-direction: column;
            gap: 0; 
          }

          .sh-left {
            flex: none; 
            width: 100%;
          }

          .sh-mobile-top {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            width: 100%;
            margin-bottom: 24px; 
          }

          .sh-avatar-desktop,
          .sh-progress-desktop {
            display: none;
          }
        }

        /* Titles / meta */
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
          line-height: 1.4;
        }
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
        .sh-verified {
          color: #6ee7d8;
          font-size: 1.2rem;
        }

        /* Progress card */
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
          margin-bottom: 1rem;
        }
        .sh-progress-ring {
          position: relative;
          width: 76px; 
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 769px) {
          .sh-progress-ring {
            width: 90px;
            height: 90px;
          }
        }
        .sh-progress-value {
          position: absolute;
          font-weight: 800;
          font-size: 1rem;
          color: #fff;
        }

        /* Top label hidden by default, shown on mobile */
        .sh-progress-label--top {
          display: none;
        }
        .sh-progress-label--bottom {
          display: block; 
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .sh-progress-label--top {
            display: block;
            margin-bottom: -4px; 
          }
          .sh-progress-label--bottom {
            display: none;
          }
          .sh-title {
            font-size: 1.5rem;
            justify-content: center;
          }
          .sh-subtitle {
            font-size: 0.85rem;
            text-align: center;
          }
          .sh-meta-item {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
        }

        @media (max-width: 576px) {
          .sh-left {
            text-align: center;
            align-items: center;
          }
          .sh-meta {
            justify-content: center;
            gap: 8px; 
          }
          .sh-meta-item {
            width: auto; 
            justify-content: center;
          }
          .sh-meta-text {
            max-width: 180px; 
          }
        }
      `}</style>

      {/* Mobile row: avatar + progress (visible only on mobile) */}
      {(avatar || showProgress) && (
        <div className="sh-mobile-top">
          {avatar && <div className="sh-avatar-mobile">{avatar}</div>}
          {showProgress && <ProgressRing />}
        </div>
      )}

      {/* Main flex container */}
      <div className="sh-hero-inner">
        {/* Desktop avatar (hidden on mobile) */}
        {avatar && <div className="sh-avatar-desktop">{avatar}</div>}

        {/* Left text content */}
        <div className="sh-left">
          <h1 className="sh-title">
            <span className="sh-name">{name || "Staff Member"}</span>
            {verified && (
              <i
                className="fa-solid fa-circle-check sh-verified"
                title="Verified Profile"
              ></i>
            )}
            <span
              className={`sh-badge ${isActiveProfile ? "sh-badge--active" : "sh-badge--inactive"
                }`}
            >
              <i
                className={`fa-solid ${isActiveProfile ? "fa-circle-check" : "fa-circle-xmark"
                  }`}
              ></i>
              {isActiveProfile ? "Active" : "Inactive"}
            </span>
          </h1>

          {/* Always the same subtitle */}
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
                <span className="sh-meta-text">
                  {limitToFirstFourWords(city) || "No location"}
                </span>
              </span>
            ) : (
              <span className="sh-meta-item">
                <i className="fa-solid fa-briefcase"></i>
                <span className="sh-meta-text">
                  {company_name || "No company name"}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Desktop progress ring (hidden on mobile) */}
        {showProgress && (
          <div className="sh-progress-desktop">
            <ProgressRing />
          </div>
        )}
      </div>
    </div>
  );
}