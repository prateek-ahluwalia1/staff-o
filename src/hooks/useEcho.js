import { useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";
import { apiURL } from "../utils/exports";

window.Pusher = Pusher;

export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state) => state.auth);
  const userId = userdata?.id || userdata?.data?.id;

  useEffect(() => {
    if (token && userId) {
      const echo = new Echo({
        broadcaster: "pusher",
        key: "443c8c0a97a80fc51fe8",
        cluster: "mt1",
        forceTLS: true,
        authorizer: (channel) => {
          return {
            authorize: (socketId, callback) => {
              fetch(`${apiURL}api/broadcasting/auth`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  socket_id: socketId,
                  channel_name: channel.name,
                }),
              })
                .then((res) => res.json())
                .then((data) => callback(false, data))
                .catch((err) => callback(true, err));
            },
          };
        },
      });

      echo
        .private(`notifications.${userId}`)
        .listen(".push.notification", (notification) => {
          dispatch(addNotification(notification));
        });

      return () => echo.disconnect();
    }
  }, [token, userId, dispatch]);
};
