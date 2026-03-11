import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { getEchoInstance, destroyEchoInstance } from "../echo";

export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state) => state.auth);
  const userId = userdata?.id || userdata?.data?.id;

  useEffect(() => {
    if (!token || !userId) return;

    const echo = getEchoInstance(token);
    const pusherConn = echo.connector.pusher.connection;

    console.log("[Echo] Connecting... current state:", pusherConn.state);

    const onConnected = () => {
      console.log(
        "%c🟢 Pusher connected — ready to receive notifications",
        "color: #22c55e; font-weight: bold;",
      );
    };
    const onFailed = () =>
      console.error("[Echo] ❌ Connection FAILED — check your Pusher key");
    const onError = (err) => {
      console.error("[Echo] ❌ Connection error:", JSON.stringify(err));
      console.error(
        "[Echo] ❌ Error detail:",
        err?.error?.message || err?.error || err,
      );
    };

    if (pusherConn.state === "connected") {
      onConnected();
    } else {
      pusherConn.bind("connected", onConnected);
    }
    pusherConn.bind("failed", onFailed);
    pusherConn.bind("error", onError);

    echo
      .private(`notifications.${userId}`)
      .listen(".push.notification", (data) => {
        console.log("✅ Notification received:", data);
        dispatch(addNotification(data));
      })
      .error((error) => {
        console.error("[Echo] Channel error:", error);
      });

    return () => {
      pusherConn.unbind("connected", onConnected);
      pusherConn.unbind("failed", onFailed);
      pusherConn.unbind("error", onError);
      // Use stopListening instead of leaveChannel so StrictMode's fake unmount
      // doesn't disconnect the underlying Pusher WebSocket.
      echo
        .private(`notifications.${userId}`)
        .stopListening(".push.notification");
    };
  }, [token, userId, dispatch]);

  // Disconnect the singleton when the user logs out
  useEffect(() => {
    if (!token) {
      destroyEchoInstance();
    }
  }, [token]);
};
