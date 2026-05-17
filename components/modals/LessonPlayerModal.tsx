import IconButton from '@/components/buttons/iconButton';
import Spacer from '@/components/common/spacer';
import { ThemedView } from '@/components/themed-view';
import { TextBody, TextHeading } from '@/components/typography';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { downloadLessonMedia, markNotSaved, removeSavedLesson } from '@/store/slices/offlineMediaSlice';
import type { StrapiLessonMinimal } from '@/types/api';
import { confirm } from '@/utils/functions/confirm';
import { formatDateAndTime } from '@/utils/functions/date';
import { fileExists } from '@/utils/offlineMedia';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import type { LessonPlayerModalRef } from '@/utils/types/modals';
import { activateSingleAudio, clearActiveSoundIf } from '@/utils/singleAudioPlayer';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import Icon from '../common/icon';
import BaseModal, { BaseModalProps } from './BaseModal';
import { useNetworkStatus } from '@/components/providers/NetworkProvider';
import { playbackRequiresNetwork } from '@/utils/playbackConnectivity';

export type LessonPlayerModalProps = Omit<BaseModalProps, 'children'> & {
  lesson: StrapiLessonMinimal | null;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = i === 0 ? 0 : v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(digits)} ${units[i]}`;
}

function getLessonMediaUrl(lesson: StrapiLessonMinimal | null) {
  if (!lesson) return '';
  return (
    lesson.video_lesson_details?.video_url ??
    lesson.lesson_details?.video_url ??
    ''
  );
}

const LessonPlayerModal = forwardRef<LessonPlayerModalRef, LessonPlayerModalProps>(
  function LessonPlayerModal({ lesson, onClose, ...props }, ref) {
    const { t } = useTranslation();
    const modalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const dispatch = useAppDispatch();

    const soundRef = useRef<AudioPlayer | null>(null);
    const descriptionSoundRef = useRef<AudioPlayer | null>(null);

    const [audioLoaded, setAudioLoaded] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [audioPositionSec, setAudioPositionSec] = useState(0);
    const [audioDurationSec, setAudioDurationSec] = useState(0);

    const [descriptionAudioLoaded, setDescriptionAudioLoaded] = useState(false);
    const [descriptionAudioPlaying, setDescriptionAudioPlaying] = useState(false);

    const mediaUrl = useMemo(() => getLessonMediaUrl(lesson), [lesson]);
    const lessonType = lesson?.lesson_type ?? '';
    const lessonId = lesson?.documentId ?? '';
    const savedEntry = useAppSelector((s) =>
      lessonId ? s.offlineMedia.byLessonId[lessonId] : undefined
    );
    const isSaved = savedEntry?.status === 'saved' && !!savedEntry.localUri;
    const isSaving = savedEntry?.status === 'saving';
    const bytesWritten = savedEntry?.bytesWritten ?? 0;
    const totalBytes = savedEntry?.totalBytes ?? null;
    const percent = useMemo(() => {
      if (!isSaving) return null;
      if (!totalBytes || totalBytes <= 0) return null;
      return Math.max(0, Math.min(100, Math.round((bytesWritten / totalBytes) * 100)));
    }, [isSaving, bytesWritten, totalBytes]);

    const playableUri = useMemo(() => {
      if (isSaved && savedEntry?.localUri) return savedEntry.localUri;
      return mediaUrl;
    }, [isSaved, savedEntry?.localUri, mediaUrl]);

    const { isOffline } = useNetworkStatus();
    const playbackBlockedOffline = useMemo(
      () => isOffline && playbackRequiresNetwork(playableUri || ''),
      [isOffline, playableUri],
    );

    const descriptionText = lesson?.lesson_description?.text_description ?? null;
    const descriptionAudioUrl = lesson?.lesson_description?.audio_description_url ?? null;
    const descriptionAudioBlockedOffline = useMemo(
      () =>
        Boolean(
          descriptionAudioUrl &&
          isOffline &&
          playbackRequiresNetwork(descriptionAudioUrl),
        ),
      [descriptionAudioUrl, isOffline],
    );

    const lessonDurationSeconds =
      lesson?.video_lesson_details?.duration_seconds ??
      lesson?.lesson_details?.duration_seconds ??
      null;

    const formattedDuration = useMemo(
      () =>
        typeof lessonDurationSeconds === 'number' && Number.isFinite(lessonDurationSeconds)
          ? formatTime(lessonDurationSeconds)
          : null,
      [lessonDurationSeconds]
    );

    const isAudio = useMemo(() => {
      const t = lessonType.toLowerCase();
      if (t.includes('audio')) return true;
      if (t.includes('video')) return false;
      return /\.(mp3|m4a|aac|wav|ogg)(\?.*)?$/i.test(mediaUrl);
    }, [lessonType, mediaUrl]);

    const videoUriForPlayer = useMemo(
      () =>
        playableUri && !playbackBlockedOffline && !isAudio ? playableUri : null,
      [isAudio, playbackBlockedOffline, playableUri],
    );
    const videoPlayer = useVideoPlayer(videoUriForPlayer);

    useEffect(() => {
      if (!playableUri || playbackBlockedOffline || isAudio) return;
      videoPlayer.play();
    }, [isAudio, playbackBlockedOffline, playableUri, videoPlayer]);

    useEffect(() => {
      if (!lessonId) return;
      const localUri = savedEntry?.localUri;
      if (!localUri) return;
      try {
        const exists = fileExists(localUri);
        if (!exists) {
          dispatch(markNotSaved({ lessonId }));
        }
      } catch {
        // If we can't verify, don't block playback.
      }
    }, [dispatch, lessonId, savedEntry?.localUri]);

    React.useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    const unloadDescriptionAudio = async () => {
      const s = descriptionSoundRef.current;
      descriptionSoundRef.current = null;
      setDescriptionAudioLoaded(false);
      setDescriptionAudioPlaying(false);
      clearActiveSoundIf(s);
      if (!s) return;
      try {
        s.pause();
        await s.seekTo(0);
      } catch {
        // ignore
      }
      try {
        s.remove();
      } catch {
        // ignore
      }
    };

    const unloadAudio = async () => {
      const s = soundRef.current;
      soundRef.current = null;
      setAudioLoaded(false);
      setAudioPlaying(false);
      setAudioPositionSec(0);
      setAudioDurationSec(0);
      clearActiveSoundIf(s);
      if (!s) return;
      try {
        s.pause();
        await s.seekTo(0);
      } catch {
        // ignore
      }
      try {
        s.remove();
      } catch {
        // ignore
      }
    };

    const handleClose = () => {
      unloadAudio().catch(() => null);
      unloadDescriptionAudio().catch(() => null);
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
      onClose?.();
    };

    useEffect(() => {
      // Ensure previous audio is torn down when switching lessons/types.
      unloadAudio().catch(() => null);
      if (!lesson || !playableUri || !isAudio || playbackBlockedOffline) return;

      let cancelled = false;

      (async () => {
        try {
          await setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: false,
          });

          const created = createAudioPlayer({ uri: playableUri }, { updateInterval: 250 });
          const sub = created.addListener('playbackStatusUpdate', (status: AudioStatus) => {
            if (!status.isLoaded) return;
            setAudioLoaded(true);
            setAudioPlaying(status.playing);
            setAudioPositionSec(status.currentTime);
            setAudioDurationSec(status.duration ?? 0);
          });

          if (cancelled) {
            sub.remove();
            created.remove();
            return;
          }

          soundRef.current = created;
          // Start playback while ensuring only one audio is active globally.
          await activateSingleAudio(created);
          if (!cancelled) {
            created.play();
          }
        } catch {
          toast.error(t('lessons.playbackError'));
        }
      })();

      return () => {
        cancelled = true;
        unloadAudio().catch(() => null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson?.documentId, playableUri, isAudio, playbackBlockedOffline]);

    useEffect(() => {
      unloadDescriptionAudio().catch(() => null);
      if (!lesson || !descriptionAudioUrl || descriptionAudioBlockedOffline) return;

      let cancelled = false;

      (async () => {
        try {
          await setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: false,
          });

          const created = createAudioPlayer({ uri: descriptionAudioUrl }, { updateInterval: 250 });
          const sub = created.addListener('playbackStatusUpdate', (status: AudioStatus) => {
            if (!status.isLoaded) return;
            setDescriptionAudioLoaded(true);
            setDescriptionAudioPlaying(status.playing);
          });

          if (cancelled) {
            sub.remove();
            created.remove();
            return;
          }

          descriptionSoundRef.current = created;
        } catch {
          toast.error(t('lessons.playbackError'));
        }
      })();

      return () => {
        cancelled = true;
        unloadDescriptionAudio().catch(() => null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson?.documentId, descriptionAudioUrl, descriptionAudioBlockedOffline]);

    useEffect(() => {
      return () => {
        unloadAudio().catch(() => null);
        unloadDescriptionAudio().catch(() => null);
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
      };
    }, [videoPlayer]);

    const toggleAudio = async () => {
      const s = soundRef.current;
      if (!s) return;
      const status = s.currentStatus;
      if (!status.isLoaded) return;
      if (status.playing) {
        s.pause();
      } else {
        const didJustFinish = status.didJustFinish === true;
        const positionSec = status.currentTime as number | undefined;
        const durationSec = status.duration as number | undefined;
        if (
          didJustFinish ||
          (typeof positionSec === 'number' &&
            typeof durationSec === 'number' &&
            positionSec >= durationSec - 0.25)
        ) {
          // Expo keeps the playhead at the end after finish; reset so next play starts over.
          await s.seekTo(0);
        }
        // Ensure only one audio track can play at a time.
        await activateSingleAudio(s);
        s.play();
      }
    };

    const toggleDescriptionAudio = async () => {
      const s = descriptionSoundRef.current;
      if (!s) return;
      const status = s.currentStatus;
      if (!status.isLoaded) return;
      if (status.playing) {
        s.pause();
      } else {
        const didJustFinish = status.didJustFinish === true;
        const positionSec = status.currentTime as number | undefined;
        const durationSec = status.duration as number | undefined;
        if (
          didJustFinish ||
          (typeof positionSec === 'number' &&
            typeof durationSec === 'number' &&
            positionSec >= durationSec - 0.25)
        ) {
          // Ensure next play starts from the beginning.
          await s.seekTo(0);
        }
        // Prevent overlapping audio (main vs description).
        await activateSingleAudio(s);
        s.play();
      }
    };

    const onSaveOffline = async () => {
      if (!lessonId || !mediaUrl) return;
      const confirmed = await confirm({
        title: t('lessons.saveOfflineConfirmTitle'),
        message: t('lessons.saveOfflineConfirmMessage'),
        confirmText: t('global.buttons.confirm'),
        cancelText: t('global.buttons.cancel'),
      });
      if (!confirmed) return;
      const toastId = toast.loading(t('lessons.downloading'));
      try {
        await dispatch(downloadLessonMedia({ lessonId, remoteUrl: mediaUrl })).unwrap();
        toast.dismiss(toastId);
        toast.success(t('lessons.savedForOffline'));
      } catch {
        toast.dismiss(toastId);
        toast.error(t('lessons.downloadFailed'));
      }
    };

    const onRemoveSaved = async () => {
      if (!lessonId) return;
      const confirmed = await confirm({
        title: t('lessons.removeOfflineConfirmTitle'),
        message: t('lessons.removeOfflineConfirmMessage'),
        confirmText: t('global.buttons.confirm'),
        cancelText: t('global.buttons.cancel'),
      });
      if (!confirmed) return;
      try {
        await dispatch(removeSavedLesson({ lessonId })).unwrap();
        toast.success(t('lessons.removedFromOffline'));
      } catch {
        toast.error(t('lessons.removeOfflineFailed'));
      }
    };

    return (
      <BaseModal ref={modalRef} onClose={handleClose} {...props}>
        <BottomSheetView style={styles.content}>
          <View style={[flexBetween, styles.header]}>
            <View>
              <TextHeading variant="title" numberOfLines={2}>
                {lesson?.title ?? t('lessons.lessonTitleFallback')}
              </TextHeading>

              <View style={[globalStyles.flex_row, globalStyles.gap_sm]}>
                {lesson?.publishedAt ? (
                  <View style={[flexBetween, globalStyles.gap_xs]}>
                    <Icon name="calendar-check-o" type='fontAwesome' size={Dimensions.FONT_SIZE_M} color={colors.primary} />
                    <TextBody variant="caption" color="secondary">
                      {formatDateAndTime(new Date(lesson.publishedAt))}
                    </TextBody>
                  </View>
                ) : null}
                {formattedDuration ? (
                  <View style={[flexBetween, globalStyles.gap_xs]}>
                    <Icon name="time-slot" type='entypo' size={Dimensions.FONT_SIZE_M} color={colors.primary} />
                    <TextBody variant="caption" color="secondary">
                      {formattedDuration}
                    </TextBody>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={[globalStyles.flex_row, globalStyles.gap_xs, globalStyles.items_center]}>
              {
                !isSaved && mediaUrl ? (
                  <IconButton
                    onPress={onSaveOffline}
                    icon={isSaved ? 'check' : isSaving ? 'loading1' : 'download'}
                    iconType="antd"
                    size="sm"
                    backgroundColor={colors.primary_light}
                    iconFill={colors.primary}
                    disabled={!lessonId || !mediaUrl || isSaved || isSaving}
                    style={globalStyles.border_dashed}
                  />
                ) : null
              }
              {isSaved ? (
                <IconButton
                  size="sm"
                  icon="delete"
                  iconType="material"
                  onPress={onRemoveSaved}
                  backgroundColor={colors.danger.light}
                  iconFill={colors.danger.primary}
                  style={globalStyles.border_dashed}
                />
              ) : null}
              <IconButton
                onPress={() => dismiss()}
                icon="close"
                iconType="antd"
                size="sm"
                backgroundColor={colors.primary_light}
                style={globalStyles.border_dashed}
              />
            </View>
          </View>

          <Spacer height={Dimensions.SCREEN_HEIGHT * 0.01} />

          {isSaving ? (
            <TextBody variant="caption" color="secondary" style={globalStyles.text_center}>
              {percent != null
                ? t('lessons.downloadingWithPercent', {
                  percent,
                  written: formatBytes(bytesWritten),
                  total: formatBytes(totalBytes ?? 0),
                })
                : t('lessons.downloadingWithWritten', {
                  written: formatBytes(bytesWritten),
                })}
            </TextBody>
          ) : null}

          {!lesson ? (
            <View style={styles.centered}>
              <TextBody variant="body2" color="secondary">
                {t('lessons.selectLessonToPlay')}
              </TextBody>
            </View>
          ) : !mediaUrl ? (
            <View style={styles.centered}>
              <TextBody variant="body2" color="secondary" style={globalStyles.text_center}>
                {t('lessons.lessonNoMedia')}
              </TextBody>
            </View>
          ) : playbackBlockedOffline ? (
            <View style={styles.centered}>
              <TextBody variant="body2" color="secondary" style={globalStyles.text_center}>
                {t('lessons.offlinePlaybackNeedsConnection')}
              </TextBody>
            </View>
          ) : isAudio ? (
            <ThemedView style={styles.audioCard}>
              <View style={[flexBetween, globalStyles.p_md]}>
                <TextBody variant="body2" color="secondary">
                  {audioLoaded
                    ? `${formatTime(audioPositionSec)} / ${formatTime(audioDurationSec)}`
                    : t('lessons.loading')}
                </TextBody>
                <IconButton
                  icon={audioPlaying ? 'pause' : 'play'}
                  iconType="ionicons"
                  onPress={toggleAudio}
                  disabled={!audioLoaded}
                  backgroundColor={colors.primary_light}
                  iconFill={colors.primary}
                  style={globalStyles.p_md}
                />
              </View>
            </ThemedView>
          ) : (
            <ThemedView style={styles.videoCard}>
              <VideoView player={videoPlayer} style={styles.video} nativeControls contentFit="contain" />
            </ThemedView>
          )}

          {descriptionText ? (
            <>
              <Spacer height={themeToken.spacing} />
              <TextBody variant="body2" color="secondary" style={styles.description}>
                {descriptionText}
              </TextBody>
            </>
          ) : null}

          {descriptionAudioUrl ? (
            <>
              <Spacer height={themeToken.spacing} />
              <ThemedView style={styles.audioCard}>
                {descriptionAudioBlockedOffline ? (
                  <TextBody variant="body2" color="secondary" style={[globalStyles.p_md, globalStyles.text_center]}>
                    {t('lessons.offlinePlaybackNeedsConnection')}
                  </TextBody>
                ) : (
                  <View style={[flexBetween, globalStyles.p_md]}>
                    <TextBody variant="body2" color="secondary">
                      {descriptionAudioLoaded ? 'Audio description' : t('lessons.loading')}
                    </TextBody>
                    <IconButton
                      icon={descriptionAudioPlaying ? 'pause' : 'play'}
                      iconType="ionicons"
                      onPress={toggleDescriptionAudio}
                      disabled={!descriptionAudioLoaded}
                      backgroundColor={colors.primary_light}
                      iconFill={colors.primary}
                      style={globalStyles.p_md}
                    />
                  </View>
                )}
              </ThemedView>
            </>
          ) : null}
        </BottomSheetView>
      </BaseModal>
    );
  }
);

export default LessonPlayerModal;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: themeToken.paddingLg,
    paddingHorizontal: themeToken.paddingLg,
  },
  header: {
    paddingTop: themeToken.paddingLg,
    gap: themeToken.spacing,
  },
  description: {
    marginTop: themeToken.spacing,
    color: colors.text.secondary,
  },
  subtitle: {
    marginTop: themeToken.spacing / 2,
    color: colors.text.secondary,
  },
  centered: {
    paddingVertical: themeToken.spacingLg,
    ...globalStyles.items_center,
    ...globalStyles.justify_center,
  },
  videoCard: {
    ...globalStyles.rounded_sm,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
  },
  audioCard: {
    ...globalStyles.rounded_sm,
    backgroundColor: colors.background.secondary,
  },
});

