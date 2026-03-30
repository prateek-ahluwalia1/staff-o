import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { receiveNewMessage } from "../store/slices/chatSlice";
import { getEchoInstance, destroyEchoInstance } from "../echo";
import { receiveIncomingCall } from "../store/slices/welfareCallSlice";

export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state) => state.auth);

  // Safely extract the current user's ID
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
        console.log("🔔 Event received:", data);

        // --- CALL HANDLING LOGIC ---
        if (data.type === "start_call" && data.roomName) {
          // Look for IDs either at the root level of the payload or nested inside a 'call' object
          const eventCallerId =
            data.caller_id || data.call?.caller_id || data.callerId;
          const eventReceiverId =
            data.receiver_id || data.call?.receiver_id || data.receiverId;

          // 1. If I am the caller, drop the event immediately. (Prevents dialing yourself)
          if (eventCallerId && String(eventCallerId) === String(userId)) {
            console.log(
              "[Echo] Dropping event: I am the initiator of this call.",
            );
            return;
          }

          // 2. If it's meant for someone else, drop it. (Double-checking security)
          if (eventReceiverId && String(eventReceiverId) !== String(userId)) {
            console.log("[Echo] Dropping event: Not meant for me.");
            return;
          }

          // If we pass the checks above, it's a genuine incoming call meant for us!
          dispatch(
            receiveIncomingCall({
              roomName: data.roomName,
              staffName: data.staffName || data.callerName || "Incoming Call",
              ...data,
            }),
          );
        }
        // --- CHAT HANDLING LOGIC ---
        else if (data.message_id && data.message) {
          dispatch(receiveNewMessage(data));
        }
        // --- GENERAL NOTIFICATIONS ---
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

  // Clean up Echo instance if user logs out
  useEffect(() => {
    if (!token) {
      destroyEchoInstance();
    }
  }, [token]);
};
