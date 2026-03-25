import { API_URL } from '@/utils/functions/env';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseLessonAudioResult {
  audioUrl: string | null;
  audioLoaded: boolean;
  audioPlaying: boolean;
  toggleAudio: () => Promise<void>;
}

export const useLessonAudio = (rawAudioUrl?: string | null): UseLessonAudioResult => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const audioUrl = useMemo(() => {
    if (!rawAudioUrl) return null;
    return rawAudioUrl.startsWith('http') ? rawAudioUrl : API_URL + rawAudioUrl;
  }, [rawAudioUrl]);

  const unloadAudio = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    setAudioLoaded(false);
    setAudioPlaying(false);
    if (!sound) return;
    try {
      await sound.stopAsync();
    } catch {
      // ignore stop errors during teardown
    }
    try {
      await sound.unloadAsync();
    } catch {
      // ignore unload errors during teardown
    }
  }, []);

  useEffect(() => {
    unloadAudio().catch(() => null);
    if (!audioUrl) return;
    let cancelled = false;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            setAudioLoaded(true);
            setAudioPlaying(status.isPlaying);
          }
        );

        if (cancelled) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
      } catch {
        setAudioLoaded(false);
        setAudioPlaying(false);
      }
    })();

    return () => {
      cancelled = true;
      unloadAudio().catch(() => null);
    };
  }, [audioUrl, unloadAudio]);

  const toggleAudio = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  }, []);

  return {
    audioUrl,
    audioLoaded,
    audioPlaying,
    toggleAudio,
  };
};
