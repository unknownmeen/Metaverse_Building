/**
 * Plays notification sound using connect.wav from public folder.
 */
const SOUND_URL = '/conect.wav';
let audioInstance = null;

function getAudio() {
  if (!audioInstance) {
    audioInstance = new Audio(SOUND_URL);
    audioInstance.volume = 0.7;
  }
  return audioInstance;
}

/**
 * Unlock audio for playback (call on user interaction).
 */
export function unlockAudio() {
  try {
    const audio = getAudio();
    audio.volume = 0.01;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.7;
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Could not unlock audio:', e);
  }
}

/**
 * Play the notification sound.
 */
export function playNotificationSound() {
  try {
    const audio = getAudio();
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.muted = false;
    audio.play().catch((e) => console.warn('Notification sound blocked:', e));
  } catch (e) {
    console.warn('Could not play notification sound:', e);
  }
}
