import type { AudioPlayer } from 'expo-audio';

// Global singleton to prevent multiple audio tracks playing at once.
let activeSound: AudioPlayer | null = null;

export function clearActiveSoundIf(sound: AudioPlayer | null | undefined) {
  if (!sound) return;
  if (activeSound === sound) activeSound = null;
}

async function stopSound(sound: AudioPlayer) {
  try {
    sound.pause();
    await sound.seekTo(0);
  } catch {
    // ignore stop errors
  }
}

export async function activateSingleAudio(sound: AudioPlayer) {
  // Stop previously active sound (unless it's the same one).
  const previous = activeSound;
  if (previous && previous !== sound) {
    await stopSound(previous);
  }
  activeSound = sound;
}

