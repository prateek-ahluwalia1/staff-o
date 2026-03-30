import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import useSubmit from "./useSubmit"; // <-- Using your custom hook!
import { getEchoInstance } from "../echo";
import { REACT_APP_AGORA_APP_ID } from "../utils/exports";

const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export function useCall(authToken, currentUserId) {
  const [callState, setCallState] = useState("idle");
  // States: idle | ringing-out | incoming | in-call | ended
  const [callInfo, setCallInfo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const localTrackRef = useRef(null);

  // Initialize your existing submit hook
  const { submit } = useSubmit({ isAuth: true });

  // ── Join Agora channel ───────────────────────────────────────
  async function joinAgora({ appId, token, channelName, uid }) {
    try {
      await agoraClient.join(appId, channelName, token, uid);
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTrackRef.current = audioTrack;
      await agoraClient.publish([audioTrack]);

      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === "audio") user.audioTrack?.play();
      });

      setCallState("in-call");
    } catch (err) {
      console.error("Agora Join Failed:", err);
      setCallState("ended");
      setTimeout(() => setCallState("idle"), 2000);
    }
  }

  // ── Caller: Initiate a call ───────────────────────────────────
  async function initiateCall(receiverId, receiverName) {
    try {
      setCallState("ringing-out");
      setCallInfo({ receiverName, role: "caller" });

      // 1. Tell backend to ring the user
      const initRes = await submit(
        "api/calls/initiate",
        { receiver_id: receiverId },
        { method: "POST" },
      );
      const channelName = initRes?.call?.channel_name;
      const callId = initRes?.call?.id;
      const callerUid =
        initRes?.call?.caller_id || Math.floor(Math.random() * 100000);

      if (!channelName)
        throw new Error("No channel name returned from initiate");

      // 2. Fetch secure Agora token for the caller
      const tokenRes = await submit(
        "api/agora/token",
        { channel_name: channelName, uid: callerUid },
        { method: "POST" },
      );
      const fetchedToken =
        tokenRes?.token || tokenRes?.data?.token || tokenRes?.data;

      // 3. Save everything to state while we wait for them to answer
      setCallInfo((prev) => ({
        ...prev,
        callId,
        channelName,
        uid: callerUid,
        token: fetchedToken,
        appId: REACT_APP_AGORA_APP_ID,
      }));
    } catch (err) {
      console.error("Initiate failed", err);
      setCallState("idle");
      setCallInfo(null);
    }
  }

  // ── Receiver: Accept incoming call ───────────────────────────
  async function acceptCall() {
    try {
      // 1. Tell backend we accepted
      await submit(
        "api/calls/accept",
        { call_id: callInfo.callId },
        { method: "POST" },
      );

      // 2. Fetch secure Agora token for the receiver
      const tokenRes = await submit(
        "api/agora/token",
        {
          channel_name: callInfo.channelName,
          uid: currentUserId,
        },
        { method: "POST" },
      );

      const fetchedToken =
        tokenRes?.token || tokenRes?.data?.token || tokenRes?.data;

      const connectionData = {
        appId: REACT_APP_AGORA_APP_ID,
        token: fetchedToken,
        channelName: callInfo.channelName,
        uid: currentUserId,
      };

      setCallInfo((prev) => ({ ...prev, ...connectionData }));

      // 3. Join the audio room!
      await joinAgora(connectionData);
    } catch (err) {
      console.error("Accept failed", err);
      setCallState("idle");
      setCallInfo(null);
    }
  }

  // ── Receiver: Reject ─────────────────────────────────────────
  async function rejectCall() {
    try {
      await submit(
        "api/calls/reject",
        { call_id: callInfo.callId },
        { method: "POST" },
      );
    } catch (e) {
      console.error(e);
    }

    setCallState("idle");
    setCallInfo(null);
  }

  // ── Either side: End call ─────────────────────────────────────
  async function endCall() {
    try {
      await submit(
        "api/calls/end",
        { call_id: callInfo.callId },
        { method: "POST" },
      );
    } catch (e) {
      console.error(e);
    }

    await hangUp();
  }

  async function hangUp() {
    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current.close();
      localTrackRef.current = null;
    }
    try {
      await agoraClient.leave();
    } catch (e) {}

    agoraClient.removeAllListeners();
    setCallState("idle");
    setCallInfo(null);
    setIsMuted(false);
  }

  async function toggleMute() {
    if (localTrackRef.current) {
      const next = !isMuted;
      await localTrackRef.current.setMuted(next);
      setIsMuted(next);
    }
  }

  // ── Listen to Laravel Echo events ─────────────────────────────
  useEffect(() => {
    if (!currentUserId || !authToken) return;

    const echo = getEchoInstance(authToken);
    const channelName = `user.${currentUserId}`;

    echo
      .private(channelName)
      .listen(".incoming.call", (data) => {
        // Double check we aren't already in a call
        setCallState((prevState) => {
          if (prevState !== "idle") return prevState;

          setCallInfo({
            callId: data.callId || data.call?.id,
            callerName: data.callerName || data.caller?.name,
            channelName: data.channelName || data.call?.channel_name,
            role: "receiver",
          });
          return "incoming";
        });
      })
      .listen(".call.accepted", async () => {
        // The receiver accepted! We already have our token from initiateCall, so just join.
        setCallState((prevState) => {
          if (prevState === "ringing-out") {
            // We must use a timeout or ref to access the latest callInfo state here in a real app,
            // but since Agora join is async, we can trigger a state update that fires a useEffect,
            // or just rely on the existing callInfo.
            return "joining-agora";
          }
          return prevState;
        });
      })
      .listen(".call.rejected", () => {
        setCallState("ended");
        setTimeout(() => {
          setCallState("idle");
          setCallInfo(null);
        }, 2000);
      })
      .listen(".call.ended", () => {
        hangUp();
      });

    return () => {
      echo.leave(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, authToken]);

  // Handle the caller joining Agora after the receiver accepts
  useEffect(() => {
    if (callState === "joining-agora" && callInfo?.token) {
      joinAgora({
        appId: callInfo.appId,
        token: callInfo.token,
        channelName: callInfo.channelName,
        uid: callInfo.uid,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState]);

  return {
    callState,
    callInfo,
    isMuted,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  };
}
