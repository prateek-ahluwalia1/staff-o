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

  const getColor = () => {
    if (pct === 0) return "#6b7280";
    if (pct < 40) return "#dc3545";
    if (pct < 80) return "#f59e0b";
    return "#16a34a";
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

  const progressColor = getColor();

  return (
    <div className="settings-header-content" style={{ position: "relative" }}>
      {/* LEFT SIDE: Text block */}
      <div className="header-text-info">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {name || "Staff Member"}

          {/* Verified badge */}
          {verified && (
            <i
              className="fa-solid fa-circle-check text-primary"
              aria-hidden="true"
              style={{ fontSize: "0.8em" }}
              title="Verified Profile"
            ></i>
          )}

          {/* Active / Inactive badge */}
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "2px 10px",
              borderRadius: "12px",
              backgroundColor: isActiveProfile ? "#dcfce7" : "#fee2e2",
              color: isActiveProfile ? "#166534" : "#991b1b",
              border: `1px solid ${isActiveProfile ? "#bbf7d0" : "#fecaca"}`,
              lineHeight: 1.4,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
            }}
            title={isActiveProfile ? "Profile is active" : "Profile is inactive"}
            aria-label={isActiveProfile ? "Active" : "Inactive"}
          >
            {isActiveProfile ? (
              <>
                <i
                  className="fa-solid fa-circle-check"
                  style={{ fontSize: "0.8em" }}
                ></i>
                Active
              </>
            ) : (
              <>
                <i
                  className="fa-solid fa-circle-xmark"
                  style={{ fontSize: "0.8em" }}
                ></i>
                Inactive
              </>
            )}
          </span>
        </h2>

        <p style={{ textTransform: "none" }}>
          Keep your information up to date so your profile stays accurate and
          complete.
        </p>

        <div className="settings-header-meta">
          <span style={{ textTransform: "none" }}>
            <i className="fa-solid fa-envelope" aria-hidden="true"></i>
            {email || "No email"}
          </span>

          {userType !== "contractor" ? (
            <>
              <span>
                <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                {limitToFirstFourWords(city) || "No location"}
              </span>
            </>
          ) : (
            <span>
              <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
              {company_name || "No company name"}
            </span>
          )}
        </div>
      </div>

      {/* Profile completion ring (unchanged) */}
      {userType !== "admin" && userType !== "customer" && pct > 0 && pct < 100 && (
        <div className="status-circle-wrapper">
          <div style={{ width: 90, height: 90, position: "relative" }}>
            <svg height={radius * 2} width={radius * 2}>
              <circle
                stroke="#e5e7eb"
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
                strokeDasharray={circumference + " " + circumference}
                style={{
                  strokeDashoffset,
                  transition: "stroke-dashoffset 0.6s ease",
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: "42%",
                left: "42%",
                transform: "translate(-50%, -50%)",
                fontWeight: "600",
                fontSize: 16,
                color: progressColor,
              }}
            >
              {pct}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}