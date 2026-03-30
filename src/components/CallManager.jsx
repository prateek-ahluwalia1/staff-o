import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useCall } from "../hooks/useCall";

export default function CallManager() {
  // 1. Get REAL auth data from Redux
  const { token, userdata } = useSelector((state) => state.auth);
  const currentUserId = userdata?.id ?? userdata?.data?.id;

  // 2. Initialize the hook
  const {
    callState,
    callInfo,
    isMuted,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  } = useCall(token, currentUserId);

  // 3. Listen for global events to start a call from ANY table or chat screen
  useEffect(() => {
    const handleStartCall = (e) => {
      const { receiverId, receiverName } = e.detail;
      initiateCall(receiverId, receiverName);
    };

    window.addEventListener("start-global-call", handleStartCall);
    return () =>
      window.removeEventListener("start-global-call", handleStartCall);
  }, [initiateCall]);

  // Hide the UI if we aren't doing anything
  if (callState === "idle") return null;

  return (
    <div style={overlay}>
      <div style={card}>
        {/* ── RINGING OUT (caller waiting) ─────────── */}
        {(callState === "ringing-out" || callState === "joining-agora") && (
          <>
            <div style={pulse}>
              <i className="fa-solid fa-phone-volume text-primary"></i>
            </div>
            <p
              style={{
                fontWeight: 600,
                marginBottom: 4,
                color: "#111827",
                fontSize: "1.2rem",
              }}
            >
              Calling {callInfo?.receiverName || "User"}...
            </p>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
              {callState === "joining-agora"
                ? "Connecting to audio..."
                : "Waiting for them to pick up"}
            </p>
            <button onClick={endCall} style={btn("#DC2626")}>
              <i className="fa-solid fa-phone-slash me-2"></i> Cancel
            </button>
          </>
        )}

        {/* ── INCOMING (receiver sees this) ────────── */}
        {callState === "incoming" && (
          <>
            <div style={pulse}>
              <i className="fa-solid fa-bell text-primary"></i>
            </div>
            <p
              style={{
                fontWeight: 600,
                fontSize: "1.2rem",
                marginBottom: 4,
                color: "#111827",
              }}
            >
              Incoming Call
            </p>
            <p style={{ color: "#374151", marginBottom: 24 }}>
              <strong>{callInfo?.callerName || "Someone"}</strong> is calling
              you
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={acceptCall} style={btn("#16A34A")}>
                <i className="fa-solid fa-phone me-2"></i> Accept
              </button>
              <button onClick={rejectCall} style={btn("#DC2626")}>
                <i className="fa-solid fa-phone-slash me-2"></i> Reject
              </button>
            </div>
          </>
        )}

        {/* ── IN CALL ──────────────────────────────── */}
        {callState === "in-call" && (
          <>
            <div style={{ ...statusDot, background: "#16A34A" }} />
            <p
              style={{
                fontWeight: 600,
                marginBottom: 4,
                color: "#111827",
                fontSize: "1.2rem",
              }}
            >
              Call in Progress
            </p>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
              {callInfo?.role === "caller"
                ? callInfo?.receiverName
                : callInfo?.callerName}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={toggleMute}
                style={btn(isMuted ? "#F59E0B" : "#6B7280")}
              >
                <i
                  className={`fa-solid ${isMuted ? "fa-microphone-lines-slash" : "fa-microphone"} me-2`}
                ></i>
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button onClick={endCall} style={btn("#DC2626")}>
                <i className="fa-solid fa-phone-slash me-2"></i> End Call
              </button>
            </div>
          </>
        )}

        {/* ── ENDED / REJECTED ─────────────────────── */}
        {callState === "ended" && (
          <div style={{ padding: "20px 0" }}>
            <p
              style={{
                color: "#DC2626",
                fontWeight: 600,
                fontSize: "1.2rem",
                margin: 0,
              }}
            >
              Call Ended
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Clean Inline Styles ---
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};
const card = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 20,
  padding: "32px 24px",
  textAlign: "center",
  width: "90%",
  maxWidth: "360px",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};
const btn = (bg) => ({
  padding: "12px 0",
  borderRadius: 10,
  border: "none",
  background: bg,
  color: "#fff",
  fontSize: 15,
  cursor: "pointer",
  fontWeight: 600,
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
const pulse = {
  width: 70,
  height: 70,
  borderRadius: "50%",
  fontSize: "28px",
  background: "#DBEAFE",
  margin: "0 auto 20px",
  animation: "pulse 1.4s ease-in-out infinite",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const statusDot = {
  width: 14,
  height: 14,
  borderRadius: "50%",
  margin: "0 auto 16px",
};

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
      70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
  `;
  document.head.appendChild(style);
}
