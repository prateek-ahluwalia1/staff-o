import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAgoraVoice } from "../hooks/useAgoraVoice";
import { useCallManager } from "../hooks/useCallManager";

export default function WelfareCallCard({ callData, isIncoming, onClose }) {
  const { inCall } = useSelector((state) => state.welfareCall);
  const { joinCall, toggleMute, isMuted, leaveCall, remoteUsers } =
    useAgoraVoice();
  const { acceptIncomingCall, endCall } = useCallManager();

  const [isAccepting, setIsAccepting] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);

  // 1. CALLER AUTO-JOIN: Join the room immediately to wait for the receiver
  useEffect(() => {
    if (!isIncoming && callData?.agoraConfig && !inCall) {
      joinCall(callData.agoraConfig).catch((err) => {
        console.error("Auto-join failed for caller", err);
      });
    }
  }, [isIncoming, callData, inCall, joinCall]);

  // 2. RINGTONE LOGIC
  const ringtoneRef = useRef(null);

  useEffect(() => {
    // Play only if it's an incoming call, we aren't connected yet, and haven't clicked accept
    if (isIncoming && !inCall && !isAccepting) {
      ringtoneRef.current = new Audio("/assets/call.mp3"); // Verify this path matches your public folder
      ringtoneRef.current.loop = true;
      ringtoneRef.current
        .play()
        .catch((e) => console.warn("Autoplay blocked by browser", e));
    }

    // Cleanup: Stop audio immediately when component unmounts or state changes
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.src = "";
        ringtoneRef.current = null;
      }
    };
  }, [isIncoming, inCall, isAccepting]);

  // 3. AUTO-HANGUP LOGIC
  // Track when the call officially connects (both users are in the Agora room)
  useEffect(() => {
    if (inCall && remoteUsers.length > 0) {
      setHasConnected(true);
    }
  }, [inCall, remoteUsers]);

  // If we WERE connected, and now remoteUsers drops to 0, they hung up!
  useEffect(() => {
    if (hasConnected && remoteUsers.length === 0) {
      console.log("Remote user left Agora. Ending call automatically.");
      handleEndCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteUsers, hasConnected]);

  // ── Actions ──────────────────────────────────────────────
  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }
  };

  const handleAccept = async () => {
    stopRingtone();
    setIsAccepting(true);

    const currentUserId = callData?.receiver_id || callData?.uid;
    const config = await acceptIncomingCall(currentUserId);

    if (config) {
      await joinCall(config);
    }
    setIsAccepting(false);
  };

  const handleEndCall = () => {
    stopRingtone();
    leaveCall();

    // Determine if we are actively rejecting an incoming call or just ending an active one
    const isReject = isIncoming && !inCall;

    endCall(isReject);
    onClose();
  };

  // ──────────────────────────────────────────────────────────
  // STATE 1: ACTIVE CALL UI
  // ──────────────────────────────────────────────────────────
  if (inCall) {
    const isWaiting = !isIncoming && remoteUsers.length === 0;

    return (
      <div
        className="bg-white p-4 rounded-4 shadow text-center"
        style={{ width: "320px" }}
      >
        <div className="mb-3">
          <div
            className={`text-white rounded-circle d-inline-flex align-items-center justify-content-center ${isWaiting ? "bg-warning" : "bg-success"}`}
            style={{ width: "60px", height: "60px" }}
          >
            <i
              className={`fa-solid ${isWaiting ? "fa-phone-volume fa-shake" : "fa-phone"} fs-3`}
            ></i>
          </div>
        </div>
        <h4 className="fw-bold mb-1">
          {isWaiting ? "Ringing..." : "Call in Progress"}
        </h4>
        <p className="text-muted small mb-4">
          {isWaiting
            ? `Waiting for ${callData?.receiverName || "User"} to answer...`
            : "You are now connected."}
        </p>

        <div className="d-flex justify-content-center gap-3">
          <button
            className={`btn rounded-pill px-4 ${isMuted ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={toggleMute}
          >
            <i
              className={`fa-solid ${isMuted ? "fa-microphone-slash" : "fa-microphone"} me-2`}
            ></i>{" "}
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            className="btn btn-danger rounded-pill px-4"
            onClick={handleEndCall}
          >
            <i className="fa-solid fa-phone-slash me-2"></i> End Call
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // STATE 2: OUTGOING CALL UI
  // ──────────────────────────────────────────────────────────
  if (!isIncoming) {
    return (
      <div
        className="bg-white p-4 rounded-4 shadow text-center"
        style={{ width: "320px" }}
      >
        <div className="mb-3">
          <div
            className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
            style={{ width: "80px", height: "80px" }}
          >
            <i className="fa-solid fa-phone-volume fa-shake fs-1"></i>
          </div>
        </div>
        <h4 className="fw-bold mb-1">Calling...</h4>
        <p className="text-muted small mb-4">
          Connecting to {callData?.receiverName || "User"}...
        </p>

        <div className="d-flex justify-content-center">
          <button
            className="btn btn-danger rounded-pill px-5 shadow-sm"
            onClick={handleEndCall}
          >
            <i className="fa-solid fa-phone-slash me-2"></i> Cancel
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // STATE 3: INCOMING CALL UI
  // ──────────────────────────────────────────────────────────
  return (
    <div
      className="bg-white p-4 rounded-4 shadow text-center"
      style={{ width: "320px" }}
    >
      <div className="mb-3">
        <div
          className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
          style={{ width: "80px", height: "80px" }}
        >
          <i className="fa-solid fa-user fs-1"></i>
        </div>
      </div>
      <h4 className="fw-bold mb-1">Incoming Call</h4>
      <p className="text-muted small mb-4">
        {callData?.callerName || callData?.staffName || "Someone"} is calling...
      </p>

      <div className="d-flex justify-content-center gap-3">
        <button
          className="btn btn-danger rounded-pill px-4 shadow-sm"
          onClick={handleEndCall}
          disabled={isAccepting}
        >
          <i className="fa-solid fa-phone-slash me-2"></i> Decline
        </button>
        <button
          className="btn btn-success rounded-pill px-4 shadow-sm"
          onClick={handleAccept}
          disabled={isAccepting}
        >
          {isAccepting ? (
            "Connecting..."
          ) : (
            <>
              <i className="fa-solid fa-phone me-2"></i> Accept
            </>
          )}
        </button>
      </div>
    </div>
  );
}
