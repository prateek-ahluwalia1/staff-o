import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { getEchoInstance, destroyEchoInstance } from "../echo";

/**
 * useEcho
 *
 * Subscribes to the authenticated user's private Pusher channel and
 * dispatches incoming notifications into Redux.
 *
 * Channel  : private-notifications.{userId}   (matches channels.php)
 * Event    : .push.notification               (matches broadcastAs() in the Event class)
 */
export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state) => state.auth); // Support both flat { id } and nested { data: { id } } shapes

  const userId = userdata?.id ?? userdata?.data?.id; // ── Subscribe / unsubscribe when token or userId changes ──────────────────

  useEffect(() => {
    if (!token || !userId) return;

    const echo = getEchoInstance(token);
    const pusherConn = echo.connector.pusher.connection; // ── Connection lifecycle handlers ──────────────────────────────────────

    const onConnected = () =>
      console.log(
        "%c:white_check_mark: Pusher connected",
        "color:#22C55E;font-weight:bold",
      );

    const onFailed = () =>
      console.error(
        "[Echo] :x: Connection FAILED — check your Pusher key/cluster",
      );

    const onError = (err) =>
      console.error("[Echo] :x: Connection error:", err?.error?.message ?? err);

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
        console.log(":bell: Notification received:", data);
        dispatch(addNotification(data));
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
