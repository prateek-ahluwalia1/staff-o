import React from "react";

export default function AvatarUpload({ profilePhoto, name, onPhotoChange }) {
  return (
    <div className="avatar-upload">
      <img
        src={profilePhoto || "/assets/images/candidates/01.jpg"}
        alt={name || "Staff"}
      />
      <label className="upload-label">
        <input type="file" onChange={onPhotoChange} accept="image/*" />
        <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
        Update Photo
      </label>
    </div>
  );
}
