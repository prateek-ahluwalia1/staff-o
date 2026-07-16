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
    <div className="settings-header-content d-flex align-items-center justify-content-between flex-wrap gap-4">
      <style>{`
        .settings-header-content {
          color: #fff;
          position: relative;
          z-index: 1;
          flex: 1;
          width: 100%;
          background: transparent !important; /* no background – inherits dark hero */
        }

        .settings-hero-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          line-height: 1.2;
          margin: 0 0 6px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          color: #fff;
        }

        .settings-hero-subtitle {
          color: rgba(255, 255, 255, 0.62);
          font-size: 14px;
          margin: 0 0 12px;
          text-transform: none;
        }

        .settings-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .settings-hero-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(6px);
          border-radius: 12px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
        }

        .settings-hero-meta-item i {
          font-size: 12px;
          opacity: 0.8;
          width: 16px;
          text-align: center;
        }

        .status-badge-premium {
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 12px;
          border-radius: 30px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid;
          letter-spacing: 0.2px;
        }

        .status-badge-premium.active {
          background: rgba(22, 163, 74, 0.12);
          color: #bbf7d0;
          border-color: rgba(34, 197, 94, 0.5);
        }

        .status-badge-premium.inactive {
          background: rgba(220, 38, 38, 0.12);
          color: #fecaca;
          border-color: rgba(248, 113, 113, 0.5);
        }

        .verified-icon-premium {
          color: #6ee7d8;
          font-size: 0.85em;
        }

        .progress-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(6px);
          border-radius: 14px;
          padding: 10px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 120px;
        }

        .progress-card-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
        }

        .progress-ring-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
        }

        .progress-percentage {
          position: absolute;
          top: 42%;
          left: 42%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          font-size: 16px;
          color: #fff;
        }

        @media (max-width: 768px) {
          .settings-hero-title {
            font-size: 22px;
          }
          .settings-hero-meta {
            gap: 8px;
          }
        }
      `}</style>

      {/* Left text content */}
      <div className="flex-grow-1">
        <h1 className="settings-hero-title">
          {name || "Staff Member"}

          {verified && (
            <i className="fa-solid fa-circle-check verified-icon-premium" title="Verified Profile"></i>
          )}

          <span
            className={`status-badge-premium ${isActiveProfile ? "active" : "inactive"}`}
            title={isActiveProfile ? "Profile is active" : "Profile is inactive"}
          >
            <i className={`fa-solid ${isActiveProfile ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
            {isActiveProfile ? "Active" : "Inactive"}
          </span>
        </h1>

        <p className="settings-hero-subtitle">
          Keep your information up to date so your profile stays accurate and complete.
        </p>

        <div className="settings-hero-meta">
          <span className="settings-hero-meta-item">
            <i className="fa-solid fa-envelope"></i>
            {email || "No email"}
          </span>

          {userType !== "contractor" ? (
            <span className="settings-hero-meta-item">
              <i className="fa-solid fa-location-dot"></i>
              {limitToFirstFourWords(city) || "No location"}
            </span>
          ) : (
            <span className="settings-hero-meta-item">
              <i className="fa-solid fa-briefcase"></i>
              {company_name || "No company name"}
            </span>
          )}
        </div>
      </div>

      {/* Right side: progress ring (only for staff / contractors, when incomplete) */}
      {userType !== "admin" && userType !== "customer" && pct > 0 && pct < 100 && (
        <div className="progress-card flex-shrink-0">
          <span className="progress-card-label">Completion</span>
          <div className="progress-ring-wrapper">
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
            <div className="progress-percentage">{pct}%</div>
          </div>
        </div>
      )}
    </div>
  );
}