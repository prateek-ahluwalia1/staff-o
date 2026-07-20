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
          background: transparent !important;
          min-width: 0;
        }

        /* Neutralize the global ".settings-header-content span" pill rule
           for every span we render here, then re-apply our own look
           explicitly. Needed because that global rule matches by tag,
           so it hits things we don't want it to. */
        .settings-header-content span {
          background: none !important;
          color: inherit !important;
          padding: 0 !important;
          border-radius: 0 !important;
          font-weight: inherit !important;
          font-size: inherit !important;
          margin-bottom: 0 !important;
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
          word-break: break-word;
        }

        .settings-hero-title-name {
          overflow-wrap: anywhere;
        }

        .settings-hero-subtitle {
          color: rgba(255, 255, 255, 0.78);
          font-size: 14px;
          margin: 0 0 12px;
          text-transform: none;
        }

        .settings-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          min-width: 0;
        }

        /* This is itself a <span>, so it needs its pill look re-applied
           explicitly — the reset above stripped it. */
        .settings-header-content .settings-hero-meta-item {
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(6px);
          border-radius: 12px !important;
          padding: 7px 14px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          color: rgba(255, 255, 255, 0.92) !important;
          max-width: 100%;
          min-width: 0;
        }

        .settings-hero-meta-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .settings-hero-meta-item i {
          font-size: 12px;
          opacity: 0.85;
          width: 16px;
          text-align: center;
          flex-shrink: 0;
        }

        /* Same story — the badge is a span, re-assert its real styling. */
        .settings-header-content .status-badge-premium {
          font-size: 11.5px !important;
          font-weight: 700 !important;
          padding: 3px 12px !important;
          border-radius: 30px !important;
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
          border: 1px solid;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .settings-header-content .status-badge-premium.active {
          background: rgba(22, 163, 74, 0.15) !important;
          color: #bbf7d0 !important;
          border-color: rgba(34, 197, 94, 0.5);
        }

        .settings-header-content .status-badge-premium.inactive {
          background: rgba(220, 38, 38, 0.15) !important;
          color: #fecaca !important;
          border-color: rgba(248, 113, 113, 0.5);
        }

        .verified-icon-premium {
          color: #6ee7d8;
          font-size: 0.9em;
          flex-shrink: 0;
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
          box-sizing: border-box;
        }

        .progress-card-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
          white-space: nowrap;
        }

        .progress-ring-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          flex-shrink: 0;
        }

        .progress-percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          font-size: 16px;
          color: #fff;
        }

        /* ---------- Responsive breakpoints ---------- */

        @media (max-width: 768px) {
          .settings-header-content {
            gap: 16px !important;
          }
          .settings-hero-title {
            font-size: 22px;
          }
          .settings-hero-subtitle {
            font-size: 13px;
          }
          .settings-header-content .settings-hero-meta-item {
            font-size: 12px !important;
          }
          .settings-hero-meta-text {
            max-width: 55vw;
          }
          .progress-card {
            min-width: 100px;
            padding: 8px 12px;
          }
          .progress-ring-wrapper {
            width: 70px;
            height: 70px;
          }
          .progress-percentage {
            font-size: 14px;
          }
        }

        @media (max-width: 576px) {
          .settings-header-content {
            gap: 12px !important;
            text-align: center;
          }
          .settings-hero-title {
            font-size: 19px;
            gap: 6px;
            justify-content: center;
          }
          .settings-hero-subtitle {
            font-size: 12.5px;
            margin-bottom: 10px;
          }
          .settings-hero-meta {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            justify-content: center;
          }
          .settings-header-content .settings-hero-meta-item {
            width: 100%;
            box-sizing: border-box;
            justify-content: center;
          }
          .settings-hero-meta-text {
            max-width: none;
            flex: initial;
          }
          .settings-header-content .status-badge-premium {
            font-size: 10.5px !important;
            padding: 2px 10px !important;
          }
          .progress-card {
            width: 100%;
            flex-direction: row;
            justify-content: center;
            gap: 12px;
            padding: 10px 14px;
            min-width: 0;
          }
          .progress-card-label {
            font-size: 10px;
          }
        }

        @media (max-width: 400px) {
          .settings-hero-title {
            font-size: 17px;
          }
          .settings-hero-subtitle {
            font-size: 12px;
          }
          .settings-header-content .status-badge-premium {
            font-size: 10px !important;
            padding: 2px 8px !important;
            gap: 4px;
          }
          .settings-header-content .settings-hero-meta-item {
            font-size: 11.5px !important;
            gap: 6px;
          }
          .progress-ring-wrapper {
            width: 56px;
            height: 56px;
          }
          .progress-percentage {
            font-size: 12px;
          }
          .progress-card-label {
            font-size: 9px;
          }
        }

        @media (max-width: 340px) {
          .settings-hero-title {
            font-size: 15.5px;
          }
          .progress-card {
            padding: 8px 10px;
          }
          .progress-ring-wrapper {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>

      {/* Left text content */}
      <div className="flex-grow-1 w-100 w-md-auto" style={{ minWidth: 0 }}>
        <h1 className="settings-hero-title">
          <span className="settings-hero-title-name">{name || "Staff Member"}</span>

          {verified && (
            <i
              className="fa-solid fa-circle-check verified-icon-premium"
              title="Verified Profile"
            ></i>
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
            <span className="settings-hero-meta-text">{email || "No email"}</span>
          </span>

          {userType !== "contractor" ? (
            <span className="settings-hero-meta-item">
              <i className="fa-solid fa-location-dot"></i>
              <span className="settings-hero-meta-text">{limitToFirstFourWords(city) || "No location"}</span>
            </span>
          ) : (
            <span className="settings-hero-meta-item">
              <i className="fa-solid fa-briefcase"></i>
              <span className="settings-hero-meta-text">{company_name || "No company name"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right side: progress ring (only for staff / contractors, when incomplete) */}
      {userType !== "admin" && userType !== "customer" && pct > 0 && pct < 100 && (
        <div className="progress-card flex-shrink-0 w-100 w-md-auto">
          <span className="progress-card-label d-none d-md-block">Completion</span>
          <div className="progress-ring-wrapper">
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
            <div className="progress-percentage">{pct}%</div>
          </div>
          <span className="progress-card-label d-md-none mt-1">Completion</span>
        </div>
      )}
    </div>
  );
}