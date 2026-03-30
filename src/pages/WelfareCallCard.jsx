import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAgoraVoice } from "../hooks/useAgoraVoice";
import { useCallManager } from "../hooks/useCallManager";
import { REACT_APP_AGORA_APP_ID } from "../utils/exports";

const WelfareCallCard = ({
  callData = {},
  isIncoming = false,
  onClose = () => {},
}) => {
  const { callStatus, remoteUsers, isMuted, joinCall, leaveCall, toggleMute } =
    useAgoraVoice();
  const { acceptIncomingCall } = useCallManager();

  // Get current user id for receiver token fetch
  const { userdata } = useSelector((state) => state.auth);
  const currentUserId = userdata?.id ?? userdata?.data?.id;

  const joinAttempted = useRef(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const targetName = isIncoming
    ? callData?.staffName ||
      callData?.callerName ||
      callData?.caller?.name ||
      "Caller"
    : callData?.receiverName || callData?.receiver?.name || "Receiver";

  // ── Outgoing caller: join Agora automatically ───────────────
  // The caller already has their token in callData.agoraConfig
  const handleOutgoingJoin = async () => {
    const appId =
      callData?.agoraConfig?.appId || REACT_APP_AGORA_APP_ID;
    const channel = callData?.agoraConfig?.channel || callData?.roomName;
    const token = callData?.agoraConfig?.token;
    const uid = callData?.agoraConfig?.uid || callData?.uid;

    if (!appId || !channel || !token) {
      alert("Missing call configuration. Cannot join.");
      onClose();
      return;
    }

    try {
      console.log("[WelfareCallCard] Caller joining Agora:", { channel, uid });
      await joinCall({ appId, channel, token, uid });
    } catch (error) {
      alert(`Call failed: ${error?.message || error?.name}`);
      onClose();
    }
  };

  // ── Receiver: fetch their token THEN join Agora ─────────────
  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      // acceptIncomingCall hits api/agora/token to get the receiver's own token
      const agoraConfig = await acceptIncomingCall(currentUserId);
      if (!agoraConfig) {
        onClose();
        return;
      }

      console.log("[WelfareCallCard] Receiver joining Agora:", agoraConfig);
      await joinCall(agoraConfig);
    } catch (error) {
      alert(`Failed to join call: ${error?.message || error?.name}`);
      onClose();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleLeaveCall = async () => {
    await leaveCall();
    onClose();
  };

  // Auto-join for OUTGOING calls only (caller side)
  useEffect(() => {
    if (!isIncoming && callStatus === "idle" && !joinAttempted.current) {
      joinAttempted.current = true;
      handleOutgoingJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIncoming, callStatus]);

  // Cleanup if component unmounts mid-call
  useEffect(() => {
    return () => {
      if (callStatus === "in-call" || callStatus === "joining") {
        leaveCall();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  const isConnected = callStatus === "in-call";
  const isJoining = callStatus === "joining" || isAccepting;

  return (
    <div
      className="card border-0 shadow-lg"
      style={{ borderRadius: "20px", width: "350px", overflow: "hidden" }}
    >
      <div className="card-body p-4 text-center">
        {/* Avatar */}
        <div className="position-relative d-inline-block mb-3">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{
              width: "80px",
              height: "80px",
              fontSize: "2rem",
              margin: "0 auto",
            }}
          >
            <i className="fa-solid fa-user"></i>
          </div>
          {/* Pulse ring when ringing */}
          {!isConnected && (
            <span
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                border: "3px solid #3b82f6",
                opacity: 0.5,
                animation: "pulse-ring 1.4s ease-in-out infinite",
              }}
            />
          )}
        </div>

        <h5 className="fw-bold mb-1 text-dark">{targetName}</h5>

        <p className="text-muted small mb-4">
          {isJoining
            ? "Connecting to call..."
            : isConnected
            ? `Connected • ${remoteUsers.length} other(s) in call`
            : isIncoming
            ? "Incoming call..."
            : "Calling... waiting for answer"}
        </p>

        {/* ── Before connected: show Accept / Decline or Cancel ── */}
        {!isConnected && !isJoining && (
          <div className="d-flex w-100 gap-3 mt-3">
            <button
              onClick={handleLeaveCall}
              className="btn btn-danger flex-grow-1 fw-semibold rounded-pill py-2 shadow-sm"
            >
              <i className="fa-solid fa-phone-slash me-2"></i>
              {isIncoming ? "Decline" : "Cancel"}
            </button>
            {isIncoming && (
              <button
                onClick={handleAccept}
                className="btn btn-success flex-grow-1 fw-semibold rounded-pill py-2 shadow-sm"
              >
                <i className="fa-solid fa-phone me-2"></i> Accept
              </button>
            )}
          </div>
        )}

        {/* ── Connecting spinner ── */}
        {isJoining && (
          <div className="d-flex justify-content-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Connecting...</span>
            </div>
          </div>
        )}

        {/* ── In-call controls ── */}
        {isConnected && (
          <div className="d-flex flex-column align-items-center gap-3">
            <span
              className="badge rounded-pill px-3 py-2 shadow-sm"
              style={{ backgroundColor: "#22c55e", color: "white" }}
            >
              <i className="fa-solid fa-circle-dot me-2"></i> Active
            </span>
            <div className="d-flex w-100 gap-2 mt-2">
              <button
                onClick={toggleMute}
                className={`btn flex-grow-1 fw-semibold rounded-pill py-2 shadow-sm ${
                  isMuted ? "btn-warning text-dark" : "btn-light border"
                }`}
              >
                <i
                  className={`fa-solid ${
                    isMuted ? "fa-microphone-lines-slash" : "fa-microphone"
                  }`}
                ></i>
              </button>
              <button
                onClick={handleLeaveCall}
                className="btn btn-danger flex-grow-1 fw-semibold rounded-pill py-2 shadow-sm"
              >
                <i className="fa-solid fa-phone-slash me-2"></i> End
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(1.3); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
      `}</style>
    </div>
  );
};

export default WelfareCallCard;
