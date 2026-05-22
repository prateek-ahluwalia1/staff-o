import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { receiveNewMessage, handleMessageDeleted } from "../store/slices/chatSlice";
import { getEchoInstance, destroyEchoInstance } from "../echo";
import {
  receiveIncomingCall,
  clearCallSession,
  setInCall,
} from "../store/slices/welfareCallSlice";
import { toast } from "react-toastify";

// Helper function to play sound
const playAlertSound = (type) => {
  const audioFile =
    type === "chat" ? "/sounds/chat.mp3" : "/sounds/notification.mp3";
  const audio = new Audio(audioFile);
  audio.play().catch((err) => console.warn("Audio autoplay blocked:", err));
};

export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state) => state.auth);

  const userId = userdata?.id ?? userdata?.data?.id;

  // 🔥 Keep track of recently ended calls so we don't ghost ring
  const deadCallsRef = useRef(new Set());

  useEffect(() => {
    if (!token || !userId) return;

    const echo = getEchoInstance(token);
    const pusherConn = echo.connector.pusher.connection;

    const onConnected = () =>
      console.log("%c✅ Pusher connected", "color:#22C55E;font-weight:bold");
    const onFailed = () => console.error("[Echo] ❌ Connection FAILED");
    const onError = (err) =>
      console.error("[Echo] ❌ Connection error:", err?.error?.message ?? err);

    if (pusherConn.state === "connected") {
      onConnected();
    } else {
      pusherConn.bind("connected", onConnected);
    }
    pusherConn.bind("failed", onFailed);
    pusherConn.bind("error", onError);

    const channelName = `notifications.${userId}`;
    const eventName = ".push.notification";

    echo
      .private(channelName)
      .listen(eventName, (data) => {
        console.log("🔔 Echo event received:", data);

        const callStatus = data.call?.status || data.status;
        const incomingCallId = data.call_id || data.call?.id;

        // ── 1. DEFENSIVE SHIELD: INTERCEPT HANGUPS FIRST ────────────────
        if (
          data.type === "rejected" || // 🔥 Matches your exact backend payload!
          data.type === "ended" ||
          data.type === "end_call" ||
          data.type === "call_ended" ||
          data.type === "call_rejected" ||
          callStatus === "ended" ||
          callStatus === "rejected" ||
          callStatus === "missed"
        ) {
          console.log("[Echo] Call ended/rejected. Clearing session.");

          // Add this call ID to our graveyard so it can NEVER ring again
          if (incomingCallId) {
            deadCallsRef.current.add(String(incomingCallId));
          }

          dispatch(clearCallSession());
          dispatch(setInCall(false));
          return;
        }

        // ── 2. INCOMING CALL HANDLING ───────────────────────────────────
        if (
          data.type === "start_call" &&
          (data.roomName || data.channel_name)
        ) {
          // 🔥 GHOST RING PREVENTION: If this call ID is in our graveyard, IGNORE IT!
          if (
            incomingCallId &&
            deadCallsRef.current.has(String(incomingCallId))
          ) {
            console.warn(
              "[Echo] Blocked ghost ring for a call that already ended.",
            );
            return;
          }

          const callerId =
            data.caller_id ?? data.call?.caller_id ?? data.callerId;
          const receiverId =
            data.receiver_id ?? data.call?.receiver_id ?? data.receiverId;

          if (callerId && String(callerId) === String(userId)) return;
          if (receiverId && String(receiverId) !== String(userId)) return;

          dispatch(
            receiveIncomingCall({
              roomName: data.roomName || data.channel_name,
              staffName:
                data.staffName ||
                data.callerName ||
                data.caller?.name ||
                "Incoming Call",
              caller_id: callerId,
              receiver_id: receiverId,
              call_id: incomingCallId,
              ...data,
            }),
          );
        }

        // ── 3. CHAT MESSAGE HANDLING ────────────────────────────────────
        else if (data.message_id && data.message) {
          playAlertSound("chat");
          const senderName = data.sender_name || data.user?.name || "Someone";
          toast.info(`New message from ${senderName}`, { icon: "💬" });
          dispatch(receiveNewMessage(data));
        }

        // ── 3.5. MESSAGE DELETION HANDLING ──────────────────────────────
        else if (data.type === "message_deleted" && data.message_id) {
          dispatch(handleMessageDeleted(data.message_id));
        }

        // ── 4. GENERAL NOTIFICATION ─────────────────────────────────────
        else {
          playAlertSound("notification");
          toast.success(
            data.title || data.message || "You have a new notification!",
            { icon: "🔔" },
          );
          dispatch(addNotification(data));
        }
      })
      .error((error) => {
        console.error("[Echo] Channel subscription error:", error);
      });

    // Also listen to specific endpoints just in case
    echo
      .private(`user.${userId}`)
      .listen(".call.ended", () => {
        dispatch(clearCallSession());
        dispatch(setInCall(false));
      })
      .listen(".call.rejected", () => {
        dispatch(clearCallSession());
        dispatch(setInCall(false));
      });

    return () => {
      pusherConn.unbind("connected", onConnected);
      pusherConn.unbind("failed", onFailed);
      pusherConn.unbind("error", onError);
      echo.private(channelName).stopListening(eventName);
      echo.private(`user.${userId}`).stopListening(".call.ended");
      echo.private(`user.${userId}`).stopListening(".call.rejected");
    };
  }, [token, userId, dispatch]);

  useEffect(() => {
    if (!token) destroyEchoInstance();
  }, [token]);
};
