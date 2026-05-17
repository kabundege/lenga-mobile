import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { activateSingleAudio, clearActiveSoundIf } from '@/utils/singleAudioPlayer';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseLessonAudioResult {
  audioUrl: string | null;
  audioLoaded: boolean;
  audioPlaying: boolean;
  /** From expo-audio, e.g. `idle`, `ready` */
  playbackState: string | null;
  toggleAudio: () => Promise<void>;
}

export const useLessonAudio = (rawAudioUrl?: string | null): UseLessonAudioResult => {
  const soundRef = useRef<AudioPlayer | null>(null);
  /** Last payload from `playbackStatusUpdate`; `sound.currentStatus` can lag behind it. */
  const latestStatusRef = useRef<AudioStatus | null>(null);
  /** Mirrors native ready flag from status updates; `currentStatus` can lag briefly after load. */
  const playbackReadyRef = useRef(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [playbackState, setPlaybackState] = useState<string | null>(null);

  const resolvedAudioUri = useOfflineAssetUri(rawAudioUrl);
  const audioUrl = useMemo(() => (resolvedAudioUri ? resolvedAudioUri : null), [resolvedAudioUri]);
  const prefetchRemoteAudio = useMemo(
    () => Boolean(audioUrl && /^https?:\/\//i.test(audioUrl)),
    [audioUrl],
  );

  const unloadAudio = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    latestStatusRef.current = null;
    playbackReadyRef.current = false;
    setAudioLoaded(false);
    setAudioPlaying(false);
    setAudioFinished(false);
    setPlaybackState(null);
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

        const sound = createAudioPlayer(
          { uri: audioUrl },
          {
            updateInterval: 250,
            // Full fetch before attaching the player avoids long `idle`/buffering on weak networks.
            ...(prefetchRemoteAudio ? { downloadFirst: true } : {}),
          },
        );
        const sub = sound.addListener('playbackStatusUpdate', (status: AudioStatus) => {
          latestStatusRef.current = status;
          setPlaybackState((prev) =>
            prev === status.playbackState ? prev : status.playbackState,
          );
          if (!status.isLoaded) return;
          playbackReadyRef.current = true;
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

        const status = sound.currentStatus;
        latestStatusRef.current = status;
        setPlaybackState((prev) => (prev === status.playbackState ? prev : status.playbackState));
        if (status.isLoaded) {
          playbackReadyRef.current = true;
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
        setPlaybackState(null);
      }
    })();

    return () => {
      cancelled = true;
      unloadAudio().catch(() => null);
    };
  }, [audioUrl, prefetchRemoteAudio, unloadAudio]);

  const toggleAudio = useCallback(async () => {
    try {
      const sound = soundRef.current;
      if (!sound || !playbackReadyRef.current) return;
      const status = latestStatusRef.current ?? sound.currentStatus;

      console.log({ status });


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
    } catch (error) {
      console.error({ error });
      // ignore
    }
  }, [audioFinished]);

  return {
    audioUrl,
    audioLoaded,
    audioPlaying,
    playbackState,
    toggleAudio,
  };
};
