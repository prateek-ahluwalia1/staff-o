import React from "react";

export default function SettingsHeaderContent({
  userType,
  name,
  email,
  city,
  gender,
}) {
  return (
    <div className="settings-header-content">
      <span>{userType || "Staff"} Profile</span>
      <h2>{name || "Staff Member"}</h2>
      <p>
        Keep your information up to date so your profile stays accurate and
        complete.
      </p>
      <div className="settings-header-meta">
        <span>
          <i className="fa-solid fa-envelope" aria-hidden="true"></i>
          {email || "No email"}
        </span>
        <span>
          <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
          {city || "No location"}
        </span>
        <span>
          <i className="fa-solid fa-user" aria-hidden="true"></i>
          {gender || "Not specified"}
        </span>
      </div>
    </div>
  );
}
