import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAgoraVoice } from "../hooks/useAgoraVoice";
import { useCallManager } from "../hooks/useCallManager";
import { apiURL } from "../utils/exports";

export default function WelfareCallCard({ callData, isIncoming, onClose }) {
  const { token } = useSelector((state) => state.auth);
  const { inCall } = useSelector((state) => state.welfareCall);

  const { joinCall, toggleMute, isMuted, leaveCall, remoteUsers } = useAgoraVoice();

  // Make sure you added addParticipant and removeParticipant to useCallManager!
  const { acceptIncomingCall, endCall, addParticipant, removeParticipant } = useCallManager();

  const [isAccepting, setIsAccepting] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);

  // --- Conference Invite States ---
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userRole, setUserRole] = useState("staff");
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 1. CALLER AUTO-JOIN
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
    if (isIncoming && !inCall && !isAccepting) {
      ringtoneRef.current = new Audio("/assets/call.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current
        .play()
        .catch((e) => console.warn("Autoplay blocked by browser", e));
    }

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.src = "";
        ringtoneRef.current = null;
      }
    };
  }, [isIncoming, inCall, isAccepting]);

  // 3. AUTO-HANGUP LOGIC
  useEffect(() => {
    if (inCall && remoteUsers.length > 0) {
      setHasConnected(true);
    }
  }, [inCall, remoteUsers]);

  useEffect(() => {
    // End call if we WERE connected, and now EVERYONE left
    if (hasConnected && remoteUsers.length === 0) {
      console.log("All remote users left Agora. Ending call automatically.");
      handleEndCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteUsers, hasConnected]);

  // 4. FETCH ACTIVE USERS FOR CONFERENCE INVITES
  useEffect(() => {
    if (!showUserPicker) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        let endpoint = "api/admin";
        if (userRole === "staff") endpoint = "api/admin/get-staff?limit=500";
        else if (userRole === "customers") endpoint = "api/admin/get-customers?limit=500";
        else if (userRole === "contractors") endpoint = "api/admin/get-contractors?limit=500";

        const res = await fetch(`${apiURL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const responseData = await res.json();

        // Parse varied backend structures
        let list = [];
        if (Array.isArray(responseData)) list = responseData;
        else if (Array.isArray(responseData.guards)) list = responseData.guards;
        else if (responseData.data && Array.isArray(responseData.data.guards)) list = responseData.data.guards;
        else if (Array.isArray(responseData.data)) list = responseData.data;
        else if (responseData.data && Array.isArray(responseData.data.data)) list = responseData.data.data;

        // Filter ONLY active users
        const activeList = list.filter((u) => {
          const uData = u?.data || u;
          const status = String(uData?.status || uData?.is_active || "").toLowerCase();
          // Adjust this condition based on your exact backend representation of "active"
          return status === "active" || status === "1" || status === "true" || uData?.status === 1 || uData?.is_active === 1;
        });

        setAvailableUsers(activeList);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [showUserPicker, userRole, token]);

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
    if (config) await joinCall(config);
    setIsAccepting(false);
  };

  const handleEndCall = () => {
    stopRingtone();
    leaveCall();
    const isReject = isIncoming && !inCall;
    endCall(isReject);
    onClose();
  };

  const handleInviteUser = async (targetUserId) => {
    const activeCallId = callData?.call_id || callData?.callId || callData?.id;
    if (!activeCallId) return;

    await addParticipant(activeCallId, targetUserId);
    setShowUserPicker(false);
    setUserSearch("");
  };

  const handleKickUser = async (targetUid) => {
    const activeCallId = callData?.call_id || callData?.callId || callData?.id;
    if (!activeCallId) return;
    await removeParticipant(activeCallId, targetUid);
  };

  // Filter available users by search query
  const filteredUsers = availableUsers.filter((u) => {
    const name = u?.name || u?.data?.name || "";
    return name.toLowerCase().includes(userSearch.toLowerCase());
  });

  // ──────────────────────────────────────────────────────────
  // STATE 1: ACTIVE CALL / CONFERENCE UI
  // ──────────────────────────────────────────────────────────
  if (inCall) {
    const isWaiting = !isIncoming && remoteUsers.length === 0;

    // --- SUB-STATE: USER PICKER OPEN ---
    if (showUserPicker) {
      return (
        <div className="bg-white p-4 rounded-4 shadow d-flex flex-column" style={{ width: "350px", height: "450px" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Add to Call</h5>
            <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowUserPicker(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <select
            className="form-select form-select-sm mb-2"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
          >
            <option value="staff">Staff</option>
            <option value="customers">Customers</option>
            <option value="contractors">Resource Partners</option>
            <option value="admin">Admins</option>
          </select>

          <input
            type="text"
            className="form-control form-control-sm mb-3"
            placeholder="Search active users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />

          <div className="flex-grow-1 overflow-auto border rounded p-2 mb-3">
            {loadingUsers ? (
              <div className="text-center text-muted small mt-4">Loading active users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-muted small mt-4">No active users found.</div>
            ) : (
              filteredUsers.map((u) => {
                const uData = u?.data || u;
                return (
                  <div key={uData.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div className="text-truncate small fw-semibold me-2">
                      {uData.name}
                    </div>
                    <button
                      className="btn btn-sm btn-primary-custom py-0 px-2"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => handleInviteUser(uData.id)}
                    >
                      Invite
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // --- NORMAL CONFERENCE VIEW ---
    return (
      <div className="bg-white p-4 rounded-4 shadow text-center" style={{ width: "350px" }}>
        <div className="mb-3">
          <div
            className={`text-white rounded-circle d-inline-flex align-items-center justify-content-center ${isWaiting ? "bg-warning" : "bg-success"}`}
            style={{ width: "60px", height: "60px" }}
          >
            <i className={`fa-solid ${isWaiting ? "fa-phone-volume fa-shake" : "fa-users"} fs-3`}></i>
          </div>
        </div>

        <h4 className="fw-bold mb-1">
          {isWaiting ? "Ringing..." : `Conference (${remoteUsers.length + 1})`}
        </h4>

        <p className="text-muted small mb-3">
          {isWaiting ? `Waiting for connection...` : "You are connected."}
        </p>

        {/* Remote Users List */}
        {remoteUsers.length > 0 && (
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
            {remoteUsers.map((user) => (
              <div key={user.uid} className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2">
                <span>
                  <i className="fa-solid fa-user text-muted me-1"></i> User {user.uid}
                </span>
                <button
                  className="btn btn-sm btn-link text-danger p-0 ms-1"
                  onClick={() => handleKickUser(user.id || user.uid)}
                  title="Remove User"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-outline-primary rounded-pill px-3"
            onClick={() => setShowUserPicker(true)}
            title="Add Participant"
          >
            <i className="fa-solid fa-user-plus"></i>
          </button>
          <button
            className={`btn rounded-pill px-3 ${isMuted ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={toggleMute}
          >
            <i className={`fa-solid ${isMuted ? "fa-microphone-slash" : "fa-microphone"}`}></i>
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
      <div className="bg-white p-4 rounded-4 shadow text-center" style={{ width: "320px" }}>
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
          <button className="btn btn-danger rounded-pill px-5 shadow-sm" onClick={handleEndCall}>
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
    <div className="bg-white p-4 rounded-4 shadow text-center" style={{ width: "320px" }}>
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