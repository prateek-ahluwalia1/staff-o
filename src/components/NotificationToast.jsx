import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TYPE_MAP = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

function ToastBody({ title, message, data, page, onNavigate }) {
  return (
    <div>
      {title && (
        <p style={{ fontWeight: "bold", margin: "0 0 4px", fontSize: "14px" }}>
          {title}
        </p>
      )}
      {message && <p style={{ margin: 0, fontSize: "13px" }}>{message}</p>}
      {data?.roster_id && (
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>
          Roster ID: {data.roster_id}
        </p>
      )}
      {data?.distance && (
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>
          📍 {data.distance} km away
        </p>
      )}
      {page && (
        <button
          onClick={onNavigate}
          style={{
            marginTop: "8px",
            padding: "4px 10px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          View →
        </button>
      )}
    </div>
  );
}

export default function NotificationToast() {
  const latestNotification = useSelector(
    (state) => state.notifications.latestNotification,
  );
  const lastShownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!latestNotification) return;
    const sig = latestNotification.id
      ? String(latestNotification.id)
      : JSON.stringify(latestNotification);
    if (lastShownRef.current === sig) return;
    lastShownRef.current = sig;

    // Play notification bell sound
    const audio = new Audio("/assets/notification-bell.wav");
    audio.play().catch(() => {});

    const title = latestNotification?.title || latestNotification?.data?.title;
    const message =
      latestNotification?.message || latestNotification?.data?.message;
    const data = latestNotification?.data;
    const page = latestNotification?.page || latestNotification?.data?.page;
    const type = latestNotification?.type || latestNotification?.data?.type;
    const toastType = TYPE_MAP[type] || "info";

    toast[toastType](
      <ToastBody
        title={title}
        message={message}
        data={data}
        page={page}
        onNavigate={() => {
          if (!page) return;
          const normalizedPage = String(page).replace(/^\/+/, "");
          navigate(`/${normalizedPage}`);
        }}
      />,
      { autoClose: 5000 },
    );
  }, [latestNotification, navigate]);

  return null;
}
