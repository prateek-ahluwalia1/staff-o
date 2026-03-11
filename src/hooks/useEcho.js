import { useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";

window.Pusher = Pusher;

export const useEcho = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      const echo = new Echo({
        broadcaster: "pusher",
        key: "443c8c0a97a80fc51fe8",
        cluster: "mt1",
        forceTLS: true,
        authorizer: (channel) => {
          return {
            authorize: (socketId, callback) => {
              fetch("http://your-api.com/api/broadcasting/auth", {
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
        .private(`App.Models.User.${user.id}`)
        .notification((notification) => {
          dispatch(addNotification(notification));
        });

      return () => echo.disconnect();
    }
  }, [token, user, dispatch]);
};
