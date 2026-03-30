import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { receiveNewMessage } from "../store/slices/chatSlice"; // <-- Add this import
import { getEchoInstance, destroyEchoInstance } from "../echo";
import { receiveIncomingCall } from "../store/slices/welfareCallSlice";

export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state) => state.auth);

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

        // If backend triggers a call event
        if (data.type === "start_call" && data.roomName) {
          dispatch(
            receiveIncomingCall({
              roomName: data.roomName,
              staffName: data.staffName || "Staff Member",
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
