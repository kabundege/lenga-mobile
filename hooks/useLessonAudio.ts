import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { activateSingleAudio, clearActiveSoundIf } from '@/utils/singleAudioPlayer';

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
  const [audioFinished, setAudioFinished] = useState(false);

  const resolvedAudioUri = useOfflineAssetUri(rawAudioUrl);
  const audioUrl = useMemo(() => (resolvedAudioUri ? resolvedAudioUri : null), [resolvedAudioUri]);

  const unloadAudio = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    setAudioLoaded(false);
    setAudioPlaying(false);
    setAudioFinished(false);
    clearActiveSoundIf(sound);
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
            // When playback finishes, Expo keeps the playhead at the end.
            // We track this so we can reset the position on next play.
            if ('didJustFinish' in status && status.didJustFinish) {
              setAudioFinished(true);
            } else if (status.isPlaying) {
              setAudioFinished(false);
            }
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
    try {
      const sound = soundRef.current;
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        const didJustFinish = (status as any).didJustFinish === true;
        if (audioFinished || didJustFinish) {
          // Ensure subsequent play starts from the beginning.
          await sound.setPositionAsync(0);
          setAudioFinished(false);
        }
        // Ensure only one audio track can play at a time.
        await activateSingleAudio(sound);
        await sound.playAsync();
      }
    } catch (error) {
      // ignore
      console.error(error);
    }
  }, [audioFinished]);

  return {
    audioUrl,
    audioLoaded,
    audioPlaying,
    toggleAudio,
  };
};
