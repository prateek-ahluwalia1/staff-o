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

  // 1. Grab the current user's DB info from Redux
  const { userdata } = useSelector((state) => state.auth);
  // Ensure we get the correct ID whether it's wrapped in a data object or not
  const myUserId = userdata?.id || userdata?.data?.id;

  const { incomingCall, outgoingCall, inCall } = useSelector(
    (state) => state.welfareCall,
  );
  const isCurrentlyInCall = inCall || !!incomingCall || !!outgoingCall;

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

      const initRes = await submit(
        "api/calls/initiate",
        { receiver_id: user.id },
        { method: "POST", silentErrorToast: true },
      );

      if (!initRes?.success || !initRes?.call) {
        toast.error(
          initRes?.error || initRes?.message || "Failed to initiate call.",
        );
        return;
      }

      const actualChannelName = initRes.call.channel_name;

      // 2. FIXED: Use actual database ID instead of Math.random()
      const tokenPayload = {
        channel_name: actualChannelName,
        uid: myUserId,
      };

      const res = await submit("api/agora/token", tokenPayload, {
        method: "POST",
        silentErrorToast: true,
      });

      if (!res?.token || res?.error) {
        toast.error(res?.error || "Failed to get token.");
        return;
      }

      dispatch(
        setOutgoingCall({
          callId: initRes.call.id,
          receiverName: user.name,
          roomName: actualChannelName,
          uid: tokenPayload.uid, // This is now your actual DB ID
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

  const acceptIncomingCall = async () => {
    if (!incomingCall) {
      toast.error("No incoming call to accept.");
      return null;
    }

    try {
      const activeId =
        incomingCall.call_id || incomingCall.callId || incomingCall.id;

      const acceptRes = await submit(
        `api/calls/accept/${activeId}`,
        { call_id: activeId },
        { method: "POST", silentErrorToast: true },
      );

      if (!acceptRes?.success) {
        toast.error(acceptRes?.error || "Failed to accept call on backend.");
        return null;
      }

      const channelName =
        acceptRes?.call?.channel_name ||
        incomingCall.roomName ||
        incomingCall.channel_name;

      // 3. FIXED: Use actual database ID instead of random generated number
      const uid = myUserId;

      const tokenRes = await submit(
        "api/agora/token",
        { channel_name: channelName, uid },
        { method: "POST", silentErrorToast: true },
      );

      if (!tokenRes?.token || tokenRes?.error) {
        toast.error(
          tokenRes?.error || "Failed to get token for incoming call.",
        );
        return null;
      }

      const agoraConfig = {
        appId: tokenRes.app_id || REACT_APP_AGORA_APP_ID,
        channel: channelName,
        token: tokenRes.token,
        uid: tokenRes.uid || uid, // This is now your actual DB ID
      };

      return agoraConfig;
    } catch (err) {
      console.error("[CallManager] acceptIncomingCall error:", err);
      toast.error(err.message || "Failed to accept call");
      return null;
    }
  };

  const endCall = async (isReject = false) => {
    const activeCallId =
      incomingCall?.call_id ||
      incomingCall?.callId ||
      incomingCall?.id ||
      outgoingCall?.callId ||
      outgoingCall?.id;

    dispatch(clearCallSession());
    dispatch(setInCall(false));

    if (activeCallId) {
      try {
        const endpoint = isReject
          ? `api/calls/reject/${activeCallId}`
          : `api/calls/end/${activeCallId}`;
        submit(endpoint).catch((e) =>
          console.error("Failed to notify backend of call end", e),
        );
      } catch (e) {
        console.error("Error ending call", e);
      }
    }
  };

  const addParticipant = async (callId, targetUserId) => {
    try {
      const res = await submit(
        `api/calls/add-participant/${callId}`,
        { user_id: targetUserId },
        { method: "POST" }
      );
      if (!res?.success) {
        toast.error(res?.error || "Failed to add participant");
      } else {
        toast.success("Participant invited!");
      }
    } catch (err) {
      toast.error("Error adding participant");
    }
  };

  const removeParticipant = async (callId, targetUserId) => {
    try {
      const res = await submit(
        `api/calls/remove-participant/${callId}`,
        { user_id: targetUserId },
        { method: "POST" }
      );
      if (!res?.success) {
        toast.error(res?.error || "Failed to remove participant");
      } else {
        toast.success("Participant removed");
      }
    } catch (err) {
      toast.error("Error removing participant");
    }
  };

  return {
    initiateCall,
    acceptIncomingCall,
    endCall,
    addParticipant,
    removeParticipant,
    isCalling,
    isCurrentlyInCall,
  };
};