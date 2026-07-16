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
  const colors = ["#0A7C6E"];
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

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
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
          className="avatar-image"
          style={{
            opacity: uploadProgress || loading ? 0.6 : 1,
            transition: "opacity 0.3s",
          }}
        />
      );
    }

    return (
      <div
        className="avatar-initials"
        style={{
          backgroundColor: getAvatarColor(name),
          opacity: uploadProgress || loading ? 0.6 : 1,
          transition: "opacity 0.3s",
        }}
      >
        {getInitials(name)}
      </div>
    );
  };

  return (
    <div className="avatar-upload-wrapper">
      <style>{`
        .avatar-upload-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          position: relative;
        }
        .avatar-container {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 22px;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }
        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .upload-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: rgba(10, 124, 110, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(4px);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        .upload-btn:hover:not(:disabled) {
          background: rgba(10, 124, 110, 0.9);
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
        }
        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }
        .max-size-text {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.65);
          margin-top: -4px;
          text-transform: none;
        }
        .spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>

      <div className="avatar-container">
        {renderAvatar()}
        {(uploadProgress || loading) && (
          <div className="spinner">
            <div className="spinner-border spinner-border-sm text-light" role="status">
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

      {userRole !== "admin" && (
        <>
          <label
            htmlFor="avatar-file-input"
            className="upload-btn"
            style={{ cursor: uploadProgress || loading ? "not-allowed" : "pointer" }}
          >
            <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
            {uploadProgress || loading ? "Uploading..." : "Update Photo"}
          </label>
          <span className="max-size-text">
            Max {MAX_FILE_SIZE_MB}MB
          </span>
        </>
      )}
    </div>
  );
}