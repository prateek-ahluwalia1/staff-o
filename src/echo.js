import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { apiURL } from "./utils/exports";

window.Pusher = Pusher;

let echoInstance = null;
let activeToken = null;

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
              return res.text().then((text) => {
                let data = {};
                console.log(
                  "[Echo] Auth raw response body:",
                  JSON.stringify(text),
                );
                try {
                  if (text) data = JSON.parse(text);
                } catch (parseErr) {
                  console.error(
                    "[Echo] Auth response body is not valid JSON:",
                    text,
                  );
                  return callback(true, {
                    error: "Invalid JSON in auth response",
                  });
                }
                if (!res.ok) {
                  console.error(`[Echo] Auth endpoint returned ${res.status}`);
                  return callback(true, data);
                }
                return callback(false, data);
              });
            })
            .catch((err) => {
              console.error("[Echo] Auth fetch threw:", err?.message || err);
              callback(true, err);
            });
        },
      }),
    });
  } else {
    const state = echoInstance.connector.pusher.connection.state;
    if (state === "disconnected" || state === "failed") {
      echoInstance.connector.pusher.connect();
    }
  }

  return echoInstance;
}

export function destroyEchoInstance() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
  activeToken = null;
}
