import React from "react";

export default function SettingsHeaderContent({
  userType,
  name,
  email,
  city,
  gender,
  company_name,
  profileCompletion = 0,
  isVerified,
}) {
  const pct = Math.min(100, Math.max(0, Number(profileCompletion) || 0));

  // Circle config
  const radius = 38;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  // Dynamic colors
  const getColor = () => {
    if (pct < 40) return "#dc3545"; // red
    if (pct < 80) return "#f59e0b"; // orange
    return "#16a34a"; // green
  };

  const progressColor = getColor();

  return (
    <div className="settings-header-content" style={{ position: "relative" }}>
      <span>
        {userType?.charAt(0)?.toUpperCase() + userType?.slice(1) || ""} Profile
      </span>

      {/* Name and Verification Badge */}
      <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {name || "Staff Member"}
        {isVerified && (
          <i
            className="fa-solid fa-circle-check text-primary"
            aria-hidden="true"
            style={{ fontSize: "0.8em" }}
            title="Verified Profile"
          ></i>
        )}
      </h2>

      <p>
        Keep your information up to date so your profile stays accurate and
        complete.
      </p>

      {/* RIGHT SIDE STATUS */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: 0,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Circular Progress */}
        <div
          style={{
            width: 90,
            height: 90,
            position: "relative",
          }}
        >
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
          {/* Percentage Text */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-70%, -90%)",
              fontWeight: "600",
              fontSize: 16,
              color: progressColor,
            }}
          >
            {pct}%
          </div>
        </div>
      </div>

      {/* META INFO */}
      <div className="settings-header-meta">
        <span>
          <i className="fa-solid fa-envelope" aria-hidden="true"></i>
          {email || "No email"}
        </span>

        {userType !== "contractor" ? (
          <>
            <span>
              <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
              {city || "No location"}
            </span>
            <span>
              <i className="fa-solid fa-user" aria-hidden="true"></i>
              {gender || "Not specified"}
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
  );
}
