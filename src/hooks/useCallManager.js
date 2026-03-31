import { useDispatch, useSelector } from "react-redux";
import {
  setOutgoingCall,
  clearCallSession,
  setInCall,
} from "../store/slices/welfareCallSlice";
import useSubmit from "./useSubmit";
import { toast } from "react-toastify";
import { REACT_APP_AGORA_APP_ID } from "../utils/exports";

export const useCallManager = () => {
  const dispatch = useDispatch();
  const { submit, loading: isCalling } = useSubmit({ isAuth: true });

  const { incomingCall, outgoingCall, inCall } = useSelector(
    (state) => state.welfareCall,
  );
  const isCurrentlyInCall = inCall || !!incomingCall || !!outgoingCall;

  // ── Caller: initiate a call ──────────────────────────────────
  const initiateCall = async (user) => {
    if (!user || !user.id) {
      toast.error("Invalid user selected.");
      return;
    }
    if (isCurrentlyInCall) {
      toast.warning("You are already in an active call!");
      return;
    }

    try {
      console.log(
        "[CallManager] Initiating call with backend for user:",
        user.id,
      );

      // 1. Tell backend to create the call and broadcast to receiver
      const initRes = await submit(
        "api/calls/initiate",
        { receiver_id: user.id },
        { method: "POST" },
      );

      if (!initRes || !initRes.success || !initRes.call) {
        toast.error(initRes?.error || "Failed to initiate call with backend.");
        return;
      }

      const actualChannelName = initRes.call.channel_name;

      // 2. 🔥 STRICT TOKEN ENDPOINT: Fetch token for CALLER
      const tokenPayload = {
        channel_name: actualChannelName,
        uid: Math.floor(Math.random() * 100000),
      };

      const res = await submit("api/agora/token", tokenPayload, {
        method: "POST",
      });

      if (!res || res.error || !res.token) {
        toast.error(res?.error || "Failed to get token.");
        return;
      }

      // 3. Set the active outgoing call in Redux
      dispatch(
        setOutgoingCall({
          callId: initRes.call.id,
          receiverName: user.name,
          roomName: actualChannelName,
          uid: tokenPayload.uid,
          agoraConfig: {
            appId: res.app_id || REACT_APP_AGORA_APP_ID,
            channel: actualChannelName,
            token: res.token,
            uid: res.uid || tokenPayload.uid,
          },
        }),
      );
    } catch (err) {
      console.error("[CallManager] initiateCall error:", err);
      toast.error(err.message || "Failed to start call");
    }
  };

  // ── Receiver: accept an incoming call ───────────────────────
  const acceptIncomingCall = async (currentUserId) => {
    if (!incomingCall) {
      toast.error("No incoming call to accept.");
      return null;
    }

    try {
      const activeId =
        incomingCall.call_id || incomingCall.callId || incomingCall.id;

      // 1. Tell backend we accepted the call
      const acceptRes = await submit(`api/calls/accept/${activeId}`);

      if (!acceptRes || !acceptRes.success) {
        toast.error(acceptRes?.error || "Failed to accept call on backend.");
        return null;
      }

      // We must use the exact channel name provided by the backend to join the caller
      const channelName =
        acceptRes?.call?.channel_name ||
        incomingCall.roomName ||
        incomingCall.channel_name;
      const uid = currentUserId || Math.floor(Math.random() * 100000);

      // 2. 🔥 STRICT TOKEN ENDPOINT: Fetch token for RECEIVER
      const tokenRes = await submit(
        "api/agora/token",
        { channel_name: channelName, uid },
        { method: "POST" },
      );

      if (!tokenRes || tokenRes.error || !tokenRes.token) {
        toast.error(
          tokenRes?.error || "Failed to get token for incoming call.",
        );
        return null;
      }

      // 3. Return the config back to WelfareCallCard so Agora can connect
      const agoraConfig = {
        appId: tokenRes.app_id || REACT_APP_AGORA_APP_ID,
        channel: channelName,
        token: tokenRes.token,
        uid: tokenRes.uid || uid,
      };

      return agoraConfig;
    } catch (err) {
      console.error("[CallManager] acceptIncomingCall error:", err);
      toast.error(err.message || "Failed to accept call");
      return null;
    }
  };

  // ── Caller/Receiver: End Call ───────────────────────────────
  const endCall = async () => {
    const activeCallId =
      incomingCall?.call_id ||
      incomingCall?.callId ||
      incomingCall?.id ||
      outgoingCall?.callId;

    if (activeCallId) {
      try {
        await submit(
          "api/calls/end",
          { call_id: activeCallId },
          { method: "POST" },
        );
      } catch (e) {
        console.error("Failed to notify backend of call end", e);
      }
    }

    // Immediately clear local UI state
    dispatch(clearCallSession());
    dispatch(setInCall(false));
  };

  return {
    initiateCall,
    acceptIncomingCall,
    endCall,
    isCalling,
    isCurrentlyInCall,
  };
};
