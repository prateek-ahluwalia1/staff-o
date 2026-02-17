import React from "react";

export default function SettingsHeaderContent({
  userType,
  name,
  email,
  city,
  gender,
  company_name,
  profileCompletion = 0,
  missingItems = [],
}) {
  const pct = Number(profileCompletion) || 0;
  let progressClass = "bg-success";
  if (pct < 40) progressClass = "bg-danger";
  else if (pct < 80) progressClass = "bg-warning";
  return (
    <div className="settings-header-content" style={{ position: "relative" }}>
      <span>{userType || "Staff"} Profile</span>
      <h2>{name || "Staff Member"}</h2>
      <p>
        Keep your information up to date so your profile stays accurate and
        complete.
      </p>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingLeft: 8,
        }}
      >
        <div className="d-none d-sm-block" style={{ minWidth: 140 }}>
          <div className="progress" style={{ height: 8 }}>
            <div
              className={`progress-bar ${progressClass}`}
              role="progressbar"
              style={{ width: `${pct}%` }}
              aria-valuenow={pct}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <small className="text-muted">Profile Completion</small>
          <small className="text-muted">{pct}%</small>
        </div>
      </div>
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
          <>
            <span>
              <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
              {company_name || "No company name"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
