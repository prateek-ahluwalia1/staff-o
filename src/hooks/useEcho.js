import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { receiveNewMessage } from "../store/slices/chatSlice";
import { getEchoInstance, destroyEchoInstance } from "../echo";
import { receiveIncomingCall } from "../store/slices/welfareCallSlice";

export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state) => state.auth);

  // Safely extract current user's ID
  const userId = userdata?.id ?? userdata?.data?.id;

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

    console.log(`[Echo] Subscribing to private channel: ${channelName}`);

    echo
      .private(channelName)
      .listen(eventName, (data) => {
        console.log("🔔 Echo event received:", data);

        // ── INCOMING CALL HANDLING ──────────────────────────────────
        if (data.type === "start_call" && (data.roomName || data.channel_name)) {
          const callerId =
            data.caller_id ?? data.call?.caller_id ?? data.callerId;
          const receiverId =
            data.receiver_id ?? data.call?.receiver_id ?? data.receiverId;

          // Drop if I am the one who started this call
          if (callerId && String(callerId) === String(userId)) {
            console.log("[Echo] Dropping: I am the caller.");
            return;
          }

          // Drop if this is not meant for me
          if (receiverId && String(receiverId) !== String(userId)) {
            console.log("[Echo] Dropping: Not meant for me.");
            return;
          }

          // Normalise the payload so WelfareCallCard can always find roomName
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
              ...data,
            })
          );
        }
        // ── CHAT MESSAGE ───────────────────────────────────────────
        else if (data.message_id && data.message) {
          dispatch(receiveNewMessage(data));
        }
        // ── GENERAL NOTIFICATION ───────────────────────────────────
        else {
          dispatch(addNotification(data));
        }
      })
      .error((error) => {
        console.error("[Echo] Channel subscription error:", error);
      });

    return () => {
      pusherConn.unbind("connected", onConnected);
      pusherConn.unbind("failed", onFailed);
      pusherConn.unbind("error", onError);
      echo.private(channelName).stopListening(eventName);
      console.log(`[Echo] Unsubscribed from ${channelName}`);
    };
  }, [token, userId, dispatch]);

  // Destroy Echo when user logs out
  useEffect(() => {
    if (!token) {
      destroyEchoInstance();
    }
  }, [token]);
};
