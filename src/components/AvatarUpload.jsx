import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
    "#0A7C6E"
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
  const { userdata } = useSelector((state) => state.auth);
  const userRole = userdata?.user_type || userdata?.data?.user_type;
  const [uploadProgress, setUploadProgress] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file size before proceeding
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = ""; // Reset the file input so the user can try again
      return;
    }

    if (onPhotoChange) {
      setUploadProgress(true);
      try {
        await onPhotoChange(file);
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        setUploadProgress(false);
      }
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
      {
        userRole !== "admin" && (
          <div className="d-flex flex-column align-items-center">
            <label
              htmlFor="avatar-file-input"
              className="upload-label mb-1"
              style={{
                cursor: uploadProgress || loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                opacity: uploadProgress || loading ? 0.6 : 1,
              }}
            >
              <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
              {uploadProgress || loading ? "Uploading..." : "Update Photo"}
            </label>
            <span style={{ fontSize: "11px", color: "#6c757d" }}>
              Max file size: {MAX_FILE_SIZE_MB}MB
            </span>
          </div>
        )
      }
    </div>
  );
}