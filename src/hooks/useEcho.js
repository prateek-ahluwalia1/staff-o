import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { receiveNewMessage, handleMessageDeleted } from "../store/slices/chatSlice";
import { getEchoInstance, destroyEchoInstance } from "../echo";
import { toast } from "react-toastify";

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
          playAlertSound("chat");
          const senderName = data.sender_name || data.user?.name || "Someone";
          toast.info(`New message from ${senderName}`, { icon: "💬" });
          dispatch(receiveNewMessage(data));
        } else if (data.type === "message_deleted" && data.message_id) {
          dispatch(handleMessageDeleted(data.message_id));
        } else {
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

    return () => {
      pusherConn.unbind("connected", onConnected);
      pusherConn.unbind("failed", onFailed);
      pusherConn.unbind("error", onError);
      echo.private(channelName).stopListening(eventName);
    };
  }, [token, userId, dispatch]);

  useEffect(() => {
    if (!token) destroyEchoInstance();
  }, [token]);
};
