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
    (state) => state.welfareCall
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
      const payload = {
        channel_name: `room_${Date.now()}`,
        uid: Math.floor(Math.random() * 100000),
        receiver_id: user.id,
      };

      console.log("[CallManager] Initiating call, payload:", payload);

      const res = await submit("api/agora/token", payload, { method: "POST" });

      if (!res || res.error) {
        toast.error(res?.error || "Failed to get token.");
        return;
      }

      if (res.token && res.channel_name) {
        dispatch(
          setOutgoingCall({
            receiverName: user.name,
            roomName: res.channel_name,
            uid: res.uid,
            agoraConfig: {
              appId: res.app_id || REACT_APP_AGORA_APP_ID,
              channel: res.channel_name,
              token: res.token,
              uid: res.uid,
            },
          })
        );
      } else {
        toast.error("API did not return a valid token.");
      }
    } catch (err) {
      console.error("[CallManager] initiateCall error:", err);
      toast.error(err.message || "Failed to start call");
    }
  };

  // ── Receiver: accept an incoming call ───────────────────────
  // When the receiver clicks "Accept", we must fetch THEIR Agora token
  // using the channel/room name that was broadcast to them via Echo.
  const acceptIncomingCall = async (currentUserId) => {
    if (!incomingCall) {
      toast.error("No incoming call to accept.");
      return null;
    }

    try {
      const channelName = incomingCall.roomName || incomingCall.channel_name;
      if (!channelName) {
        toast.error("Call has no channel name.");
        return null;
      }

      const uid = currentUserId || Math.floor(Math.random() * 100000);

      console.log("[CallManager] Fetching receiver token for channel:", channelName);

      const res = await submit(
        "api/agora/token",
        { channel_name: channelName, uid },
        { method: "POST" }
      );

      if (!res || res.error || !res.token) {
        toast.error(res?.error || "Failed to get token for incoming call.");
        return null;
      }

      // Return the full config so WelfareCallCard can join immediately
      const agoraConfig = {
        appId: res.app_id || REACT_APP_AGORA_APP_ID,
        channel: res.channel_name || channelName,
        token: res.token,
        uid: res.uid || uid,
      };

      console.log("[CallManager] Receiver agoraConfig ready:", agoraConfig);
      return agoraConfig;
    } catch (err) {
      console.error("[CallManager] acceptIncomingCall error:", err);
      toast.error(err.message || "Failed to accept call");
      return null;
    }
  };

  const endCall = () => {
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
