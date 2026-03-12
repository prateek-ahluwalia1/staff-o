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
          const authUrl = `${apiURL}broadcasting/auth`;

          console.log("[Echo] Authorizing channel:", channel.name);

          fetch(authUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${activeToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then(async (res) => {
              const text = await res.text();

              if (!text || !text.trim()) {
                console.error(
                  `[Echo] Auth returned ${res.status} with empty body.`,
                  "Check routes/channels.php and BroadcastServiceProvider.",
                );
                return callback(true, { error: "Empty auth response" });
              }

              let data;
              try {
                data = JSON.parse(text);
              } catch {
                console.error("[Echo] Auth response is not valid JSON:", text);
                return callback(true, {
                  error: "Invalid JSON in auth response",
                });
              }

              if (!res.ok) {
                console.error(
                  `[Echo] Auth failed with status ${res.status}:`,
                  data,
                );
                return callback(true, data);
              }

              console.log("[Echo] Auth successful for channel:", channel.name);
              return callback(false, data);
            })
            .catch((err) => {
              console.error("[Echo] Auth fetch error:", err?.message ?? err);
              callback(true, { error: err?.message ?? "Network error" });
            });
        },
      }),
    });
  } else {
    const state = echoInstance.connector.pusher.connection.state;
    if (state === "disconnected" || state === "failed") {
      console.log("[Echo] Reconnecting (state was:", state, ")");
      echoInstance.connector.pusher.connect();
    }
  }

  return echoInstance;
}

export function destroyEchoInstance() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    activeToken = null;
    console.log("[Echo] Instance destroyed.");
  }
}
