import { Audio } from 'expo-av';

// Global singleton to prevent multiple Expo sounds playing at once.
let activeSound: Audio.Sound | null = null;

export function clearActiveSoundIf(sound: Audio.Sound | null | undefined) {
  if (!sound) return;
  if (activeSound === sound) activeSound = null;
}

async function stopSound(sound: Audio.Sound) {
  try {
    await sound.stopAsync();
  } catch {
    // ignore stop errors
  }
}

export async function activateSingleAudio(sound: Audio.Sound) {
  // Stop previously active sound (unless it's the same one).
  const previous = activeSound;
  if (previous && previous !== sound) {
    await stopSound(previous);
  }
  activeSound = sound;
}

