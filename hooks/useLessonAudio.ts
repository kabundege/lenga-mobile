import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { activateSingleAudio, clearActiveSoundIf } from '@/utils/singleAudioPlayer';

interface UseLessonAudioResult {
  audioUrl: string | null;
  audioLoaded: boolean;
  audioPlaying: boolean;
  toggleAudio: () => Promise<void>;
}

export const useLessonAudio = (rawAudioUrl?: string | null): UseLessonAudioResult => {
  const soundRef = useRef<AudioPlayer | null>(null);
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
      sound.pause();
      await sound.seekTo(0);
    } catch {
      // ignore stop errors during teardown
    }
    try {
      sound.remove();
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
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });

        const sound = createAudioPlayer({ uri: audioUrl }, { updateInterval: 250 });
        const sub = sound.addListener('playbackStatusUpdate', (status: AudioStatus) => {
          if (!status.isLoaded) return;
          setAudioLoaded(true);
          setAudioPlaying(status.playing);
          // When playback finishes, we reset on next play.
          if (status.didJustFinish) {
            setAudioFinished(true);
          } else if (status.playing) {
            setAudioFinished(false);
          }
        });

        if (cancelled) {
          sub.remove();
          sound.remove();
          return;
        }

        // Mark audio as ready right after successful load.
        const status = sound.currentStatus;
        if (status.isLoaded) {
          setAudioLoaded(true);
          setAudioPlaying(status.playing);
        }

        soundRef.current = sound;

        if (cancelled) {
          sub.remove();
          sound.remove();
        }
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
      const status = sound.currentStatus;
      if (!status.isLoaded) return;
      if (status.playing) {
        sound.pause();
      } else {
        const didJustFinish = status.didJustFinish === true;
        if (audioFinished || didJustFinish) {
          // Ensure subsequent play starts from the beginning.
          await sound.seekTo(0);
          setAudioFinished(false);
        }
        // Ensure only one audio track can play at a time.
        await activateSingleAudio(sound);
        sound.play();
      }
    } catch {
      // ignore
    }
  }, [audioFinished]);

  return {
    audioUrl,
    audioLoaded,
    audioPlaying,
    toggleAudio,
  };
};
