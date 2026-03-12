import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { apiURL } from "../../utils/exports";
import { addNotification } from "../slices/notificationSlice";
import { addMessage } from "../slices/chatSlice";
let echoInstance = null;

const socketMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const { token, user } = state.auth;

  // Initialize connection if token exists and no instance is running
  if (token && user && !echoInstance) {
    window.Pusher = Pusher;

    echoInstance = new Echo({
      broadcaster: "pusher",
      key: "443c8c0a97a80fc51fe8",
      cluster: "ap2",
      forceTLS: true,
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          fetch(`${apiURL}broadcasting/auth`, {
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
      }),
    });

    // Listener 1: Laravel Database Notifications
    echoInstance
      .private(`App.Models.User.${user.id}`)
      .notification((notification) => {
        store.dispatch(addNotification(notification));
      });

    // Listener 2: Live Chat Messages (Future-ready)
    echoInstance
      .private(`User.Chat.${user.id}`)
      .listen("MessageSent", (data) => {
        store.dispatch(addMessage(data.message));
      });
  }

  // Disconnect on Logout
  if (action.type === "auth/logOut" && echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  return result;
};

export default socketMiddleware;
