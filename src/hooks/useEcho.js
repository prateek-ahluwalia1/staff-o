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

        if (
          data.type === "start_call" &&
          (data.roomName || data.channel_name)
        ) {
          const callerId =
            data.caller_id ?? data.call?.caller_id ?? data.callerId;
          const receiverId =
            data.receiver_id ?? data.call?.receiver_id ?? data.receiverId;

          if (callerId && String(callerId) === String(userId)) {
            console.log("[Echo] Dropping: I am the caller.");
            return;
          }
          if (receiverId && String(receiverId) !== String(userId)) {
            console.log("[Echo] Dropping: Not meant for me.");
            return;
          }

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
            }),
          );
        } else if (data.message_id && data.message) {
          dispatch(receiveNewMessage(data));
        } else {
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

  useEffect(() => {
    if (!token) {
      destroyEchoInstance();
    }
  }, [token]);
};
