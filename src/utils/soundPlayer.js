// src/utils/soundPlayer.js

const sounds = {
  call: new Audio("/assets/call.mp3"),
  notification: new Audio("/assets/notification-bell.wav"),
};

export function playSound(type) {
  const sound = sounds[type];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}
