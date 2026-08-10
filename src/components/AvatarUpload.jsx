import React, { useRef } from "react";
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
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    if (onPhotoChange) {
      try {
        await onPhotoChange(file);
      } catch (error) {
        console.error("Error uploading photo:", error);
      }
    }
  };

  const openFileDialog = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  const renderAvatar = () => {
    if (profilePhoto) {
      return (
        <img
          src={profilePhoto}
          alt={name || "Staff"}
          className="avatar-image"
          style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.3s" }}
        />
      );
    }

    return (
      <div
        className="avatar-initials"
        style={{
          backgroundColor: getAvatarColor(name),
          opacity: loading ? 0.6 : 1,
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
          position: relative;
        }
        .avatar-container {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 22px;
          overflow: visible;
          border: 3px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          cursor: pointer;
        }
        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 19px;
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
          border-radius: 19px;
        }
        .edit-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 32px;
          height: 32px;
          background: rgba(10, 124, 110, 0.9);
          border: 2px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 2;
          transition: transform 0.2s ease;
        }
        .edit-badge i {
          color: #fff;
          font-size: 0.85rem;
        }
        .avatar-container:active .edit-badge {
          transform: scale(0.95);
        }
        .spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
        }
      `}</style>

      <div className="avatar-container" onClick={openFileDialog}>
        {renderAvatar()}
        {!loading && (
          <div className="edit-badge">
            <i className="fa-solid fa-pencil"></i>
          </div>
        )}
        {loading && (
          <div className="spinner">
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
        disabled={loading}
      />
    </div>
  );
}