import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import AgoraRTC from "agora-rtc-sdk-ng";
import { setInCall } from "../store/slices/welfareCallSlice";

// One shared client instance for the lifetime of the app
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export function useAgoraVoice() {
  const dispatch = useDispatch();
  const [callStatus, setCallStatus] = useState("idle"); // idle | joining | in-call | error
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const localAudioRef = useRef(null);

  useEffect(() => {
    // Remote user starts publishing (joins and unmutes)
    // Remote user starts publishing (joins and unmutes)
    const handleUserPublished = async (user, mediaType) => {
      console.log(`[Agora] Remote user ${user.uid} published ${mediaType}`);

      await client.subscribe(user, mediaType);
      console.log(`[Agora] Subscribed to ${user.uid}'s ${mediaType}`);

      if (mediaType === "audio") {
        console.log(`[Agora] Attempting to play audio for ${user.uid}...`);

        // Sometimes browsers require a split-second delay before playing
        setTimeout(() => {
          user.audioTrack?.play();
          console.log(`[Agora] Audio play triggered for ${user.uid}`);
        }, 100);

        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          return exists ? prev : [...prev, user];
        });
      }
    };

    // Remote user stops publishing (mutes / disconnects track)
    const handleUserUnpublished = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    // Remote user leaves the channel entirely
    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, []);

  // Join the Agora channel. Config is passed directly (already fetched upstream).
  async function joinCall({ appId, channel, token, uid }) {
    try {
      setCallStatus("joining");
      console.log("[useAgoraVoice] Joining:", { appId, channel, uid });

      await client.join(appId, channel, token, uid ?? null);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioRef.current = audioTrack;
      await client.publish([audioTrack]);

      setCallStatus("in-call");
      dispatch(setInCall(true)); // tell Redux we're live
    } catch (err) {
      console.error("[useAgoraVoice] join failed:", err);
      setCallStatus("error");
      dispatch(setInCall(false));
      throw err; // let the caller surface an alert
    }
  }

  async function leaveCall() {
    // Stop and close local audio track
    if (localAudioRef.current) {
      localAudioRef.current.stop();
      localAudioRef.current.close();
      localAudioRef.current = null;
    }
    try {
      await client.leave();
    } catch (e) {
      console.error("[useAgoraVoice] error on leave:", e);
    }
    setRemoteUsers([]);
    setIsMuted(false);
    setCallStatus("idle");
    dispatch(setInCall(false));
  }

  async function toggleMute() {
    if (localAudioRef.current) {
      const next = !isMuted;
      await localAudioRef.current.setMuted(next);
      setIsMuted(next);
    }
  }

  return { callStatus, remoteUsers, isMuted, joinCall, leaveCall, toggleMute };
}
