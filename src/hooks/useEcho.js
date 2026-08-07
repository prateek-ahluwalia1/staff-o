import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { receiveNewMessage, handleMessageDeleted } from "../store/slices/chatSlice";
import { getEchoInstance, destroyEchoInstance } from "../echo";
import { toast } from "react-toastify";

// 1. Singleton Audio instance to prevent overlapping sounds and memory leaks
let audioInstance = null;
const playAlertSound = () => {
  if (!audioInstance) {
    audioInstance = new Audio("/sounds/notification.wav");
  }

  // Reset to start so rapid messages don't overlap or fail
  audioInstance.currentTime = 0;
  audioInstance.play().catch((err) => console.warn("Audio autoplay blocked by browser:", err));
};

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

    echo
      .private(channelName)
      .listen(eventName, (data) => {
        console.log("🔔 Echo event received:", data);

        if (data.message_id && data.message) {
          // ----- Chat message -----
          playAlertSound();
          const senderName = data.sender_name || data.user?.name || "Someone";
          toast.info(`New message from ${senderName}`, { icon: "💬" });
          dispatch(receiveNewMessage(data));

        } else if (data.type === "message_deleted" && data.message_id) {
          // ----- Deleted message (no toast/sound needed) -----
          dispatch(handleMessageDeleted(data.message_id));

        } else {
          // ----- All other notifications -----
          dispatch(addNotification(data));
        }
      })
      .error((error) => {
        console.error("[Echo] Channel subscription error:", error);
      });

    return () => {
      // Clean up connection listeners
      pusherConn.unbind("connected", onConnected);
      pusherConn.unbind("failed", onFailed);
      pusherConn.unbind("error", onError);

      // 2. Stop listening AND fully leave the channel to free up Pusher limits
      echo.private(channelName).stopListening(eventName);
      echo.leaveChannel(channelName);
    };
  }, [token, userId, dispatch]);

  // Clean up the entire Echo instance if the token disappears (e.g., Logout)
  useEffect(() => {
    if (!token) {
      destroyEchoInstance();
    }
  }, [token]);
};