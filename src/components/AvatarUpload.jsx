import React from "react";

export default function AvatarUpload({ profilePhoto, name, onPhotoChange }) {
  return (
    <div
      className="avatar-upload"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <img
        src={profilePhoto || "/assets/images/candidates/01.jpg"}
        alt={name || "Staff"}
        style={{
          width: 120,
          height: 120,
          objectFit: "cover",
          borderRadius: "10%",
        }}
      />

      <input
        id="avatar-file-input"
        type="file"
        onChange={onPhotoChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <label
        htmlFor="avatar-file-input"
        className="upload-label"
        style={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
        Update Photo
      </label>
    </div>
  );
}
