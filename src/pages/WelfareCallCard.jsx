import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { REACT_APP_AGORA_APP_ID } from "../utils/exports";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const WelfareCallCard = ({
  callData = {},
  isIncoming = false,
  onClose = () => {},
}) => {
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [networkQuality, setNetworkQuality] = useState("Good");

  const joinAttempted = useRef(false);

  const targetName = isIncoming
    ? callData?.staffName || callData?.callerName
    : callData?.receiverName;

  const handleJoinCall = async () => {
    let appId, token, channel, uid;

    if (callData?.agoraConfig) {
      appId = callData.agoraConfig.appId;
      token = callData.agoraConfig.token;
      channel = callData.agoraConfig.channel;
      uid = callData.agoraConfig.uid;
    } else {
      appId = REACT_APP_AGORA_APP_ID;
      token = callData?.token;
      channel = callData?.roomName;
      uid = null;
    }

    if (!appId || !channel) {
      alert("Missing call configuration. Cannot connect.");
      onClose();
      return;
    }

    try {
      await client.join(appId, channel, token, uid);
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      await client.publish([audioTrack]);
      setInCall(true);
    } catch (error) {
      console.error("Agora Join Error:", error);
      alert(
        `Call failed: ${error?.message || error?.name || "Check microphone permissions."}`,
      );
      onClose();
    }
  };

  const handleLeaveCall = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    await client.leave();
    setInCall(false);
    setLocalAudioTrack(null);
    setIsMuted(false);
    onClose();
  };

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (!isIncoming && !inCall && !joinAttempted.current) {
      joinAttempted.current = true;
      handleJoinCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIncoming, inCall]);

  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    };

    const handleNetworkQuality = (stats) => {
      if (
        stats.uplinkNetworkQuality >= 4 ||
        stats.downlinkNetworkQuality >= 4
      ) {
        setNetworkQuality("Poor");
      } else {
        setNetworkQuality("Good");
      }
    };

    client.on("user-published", handleUserPublished);
    client.on("network-quality", handleNetworkQuality);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("network-quality", handleNetworkQuality);
      if (inCall) handleLeaveCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCall]);

  return (
    <div
      className="card border-0 shadow-lg"
      style={{ borderRadius: "20px", width: "350px", overflow: "hidden" }}
    >
      <div className="card-body p-4 text-center">
        <div className="position-relative d-inline-block mb-3">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "80px",
              height: "80px",
              fontSize: "2rem",
              margin: "0 auto",
            }}
          >
            <i className="fa-solid fa-user"></i>
          </div>
        </div>

        <h5 className="fw-bold mb-1 text-dark">
          {targetName || "Unknown User"}
        </h5>
        <p className="text-muted small mb-4">
          {!inCall
            ? isIncoming
              ? "Incoming Call..."
              : "Dialing..."
            : "Connected"}
        </p>

        {!inCall ? (
          <div className="d-flex w-100 gap-3 mt-3">
            <button
              onClick={onClose}
              className="btn btn-danger flex-grow-1 fw-semibold rounded-pill py-2 shadow-sm"
            >
              {isIncoming ? "Decline" : "Cancel"}
            </button>
            {isIncoming && (
              <button
                onClick={handleJoinCall}
                className="btn btn-success flex-grow-1 fw-semibold rounded-pill py-2 shadow-sm"
              >
                Accept
              </button>
            )}
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className="badge rounded-pill px-3 py-2 shadow-sm"
                style={{ backgroundColor: "#22c55e", color: "white" }}
              >
                <i className="fa-solid fa-circle-dot me-2"></i> Active
              </span>
              {networkQuality === "Poor" && (
                <span className="badge rounded-pill bg-warning text-dark px-3 py-2">
                  Weak Connection
                </span>
              )}
            </div>

            <div className="d-flex w-100 gap-2 mt-2">
              <button
                onClick={toggleMic}
                className={`btn flex-grow-1 fw-semibold rounded-pill py-2 shadow-sm ${isMuted ? "btn-warning text-dark" : "btn-light border"}`}
              >
                <i
                  className={`fa-solid ${isMuted ? "fa-microphone-lines-slash" : "fa-microphone"}`}
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
    </div>
  );
};

export default WelfareCallCard;
