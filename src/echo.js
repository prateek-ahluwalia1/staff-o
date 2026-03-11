import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { apiURL } from "./utils/exports";

window.Pusher = Pusher;

let echoInstance = null;
let activeToken = null;

/**
 * Returns the singleton Echo instance, creating it on first call.
 * Keeps `activeToken` current so the authorizer always uses the latest token.
 */
export function getEchoInstance(token) {
  activeToken = token;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "pusher",
      key: "443c8c0a97a80fc51fe8",
      cluster: "ap2",
      forceTLS: true,
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          const authUrl = `${apiURL}api/broadcasting/auth`;
          console.log(
            "[Echo] Auth request →",
            authUrl,
            "channel:",
            channel.name,
          );
          fetch(authUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${activeToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then((res) => {
              console.log("[Echo] Auth response status:", res.status);
              if (!res.ok) {
                console.error(`[Echo] Auth endpoint returned ${res.status}`);
                return res.json().then((data) => callback(true, data));
              }
              return res.json().then((data) => callback(false, data));
            })
            .catch((err) => {
              console.error("[Echo] Auth fetch threw:", err?.message || err);
              callback(true, err);
            });
        },
      }),
    });
  } else {
    // If the singleton exists but the underlying Pusher connection is in a
    // terminal/failed state (e.g. from StrictMode's fake unmount), reconnect it.
    const state = echoInstance.connector.pusher.connection.state;
    if (state === "disconnected" || state === "failed") {
      echoInstance.connector.pusher.connect();
    }
  }

  return echoInstance;
}

/** Disconnect and destroy the singleton (call on logout). */
export function destroyEchoInstance() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
  activeToken = null;
}
