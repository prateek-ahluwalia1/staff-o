import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { REACT_APP_AGORA_APP_ID } from "../utils/exports";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const WelfareCallCard = ({ roomName, staffName, agoraConfig }) => {
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [networkQuality, setNetworkQuality] = useState("Good");

  // Fetch token from Laravel backend (fallback)
  const fetchToken = async () => {
    try {
      const response = await fetch(`api/agora/token?channelName=${roomName}`);
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Failed to fetch token:", error);
      return null;
    }
  };

  const handleJoinCall = async () => {
    let appId, token, channel, uid;
    if (agoraConfig) {
      appId = agoraConfig.appId;
      token = agoraConfig.token;
      channel = agoraConfig.channel;
      uid = agoraConfig.uid;
    } else {
      appId = REACT_APP_AGORA_APP_ID;
      token = await fetchToken();
      channel = roomName;
      uid = null;
    }

    if (!token || !appId || !channel) {
      alert("Could not connect to the server.");
      return;
    }

    try {
      await client.join(appId, channel, token, uid);
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      await client.publish([audioTrack]);
      setInCall(true);
    } catch (error) {
      console.error("Error joining:", error);
      alert("Microphone access denied or connection failed.");
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
  };

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

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
    // Styled to match the white cards with soft shadows in your dashboard
    <div
      className="card border-0 shadow-sm"
      style={{ borderRadius: "16px", maxWidth: "400px" }}
    >
      <div className="card-body p-4 text-center">
        {/* Header Section */}
        <h5 className="fw-bold mb-1" style={{ color: "#2C323F" }}>
          Welfare Call
        </h5>
        <p className="text-muted small mb-4">
          Calling: <strong>{staffName || "Staff Member"}</strong>
        </p>

        {!inCall ? (
          // Matches your "Add Leave +" blue pill button style
          <button
            onClick={handleJoinCall}
            className="btn btn-primary w-100 fw-semibold rounded-pill py-2"
            style={{ backgroundColor: "#3b82f6", border: "none" }}
          >
            Start Call
          </button>
        ) : (
          <div className="d-flex flex-column align-items-center gap-3">
            {/* Status Indicator matching your table's "Active" pill */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{ backgroundColor: "#22c55e", color: "white" }}
              >
                ● Active Call
              </span>
              {networkQuality === "Poor" && (
                <span className="badge rounded-pill bg-warning text-dark px-3 py-2">
                  Weak Connection
                </span>
              )}
            </div>

            {/* Call Controls */}
            <div className="d-flex w-100 gap-2">
              <button
                onClick={toggleMic}
                className={`btn flex-grow-1 fw-semibold rounded-pill py-2 ${isMuted ? "btn-warning text-dark" : "btn-light border"}`}
              >
                {isMuted ? "Unmute Mic" : "Mute Mic"}
              </button>

              <button
                onClick={handleLeaveCall}
                className="btn btn-danger flex-grow-1 fw-semibold rounded-pill py-2"
              >
                End Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelfareCallCard;
