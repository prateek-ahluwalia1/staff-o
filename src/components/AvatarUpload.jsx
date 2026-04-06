import React, { useState } from "react";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA15E",
    "#BC6C25",
  ];
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function AvatarUpload({
  profilePhoto,
  name,
  onPhotoChange,
  loading = false,
}) {
  const [uploadProgress, setUploadProgress] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && onPhotoChange) {
      setUploadProgress(true);
      await onPhotoChange(file);
      setUploadProgress(false);
    }
  };

  const renderAvatar = () => {
    if (profilePhoto) {
      return (
        <img
          src={profilePhoto}
          alt={name || "Staff"}
          style={{
            width: 120,
            height: 120,
            objectFit: "cover",
            borderRadius: "10%",
            opacity: uploadProgress || loading ? 0.6 : 1,
            transition: "opacity 0.3s",
          }}
        />
      );
    }

    // Show initials badge instead of default photo
    return (
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "10%",
          backgroundColor: getAvatarColor(name),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "white",
          opacity: uploadProgress || loading ? 0.6 : 1,
          transition: "opacity 0.3s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {getInitials(name)}
      </div>
    );
  };

  return (
    <div
      className="avatar-upload"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        position: "relative",
      }}
    >
      <div style={{ position: "relative" }}>
        {renderAvatar()}
        {(uploadProgress || loading) && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      <input
        id="avatar-file-input"
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
        disabled={uploadProgress || loading}
      />

      <label
        htmlFor="avatar-file-input"
        className="upload-label"
        style={{
          cursor: uploadProgress || loading ? "not-allowed" : "pointer",
          display: "inline-flex",
          width: "80%",
          alignItems: "center",
          gap: 6,
          opacity: uploadProgress || loading ? 0.6 : 1,
        }}
      >
        <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
        {uploadProgress || loading ? "Uploading..." : "Update Photo"}
      </label>
    </div>
  );
}
