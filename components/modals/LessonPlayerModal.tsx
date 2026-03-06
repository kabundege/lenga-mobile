import IconButton from '@/components/buttons/iconButton';
import Spacer from '@/components/common/spacer';
import { ThemedView } from '@/components/themed-view';
import { TextBody, TextHeading } from '@/components/typography';
import type { StrapiLessonMinimal } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import type { LessonPlayerModalRef } from '@/utils/types/modals';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { Audio, ResizeMode, Video, type AVPlaybackStatus } from 'expo-av';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import BaseModal, { BaseModalProps } from './BaseModal';

export type LessonPlayerModalProps = Omit<BaseModalProps, 'children'> & {
  lesson: StrapiLessonMinimal | null;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
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
    const modalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();

    const videoRef = useRef<Video>(null);

    const soundRef = useRef<Audio.Sound | null>(null);

    const [audioLoaded, setAudioLoaded] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [audioPositionSec, setAudioPositionSec] = useState(0);
    const [audioDurationSec, setAudioDurationSec] = useState(0);

    const mediaUrl = useMemo(() => getLessonMediaUrl(lesson), [lesson]);
    const lessonType = lesson?.lesson_type ?? '';

    const isAudio = useMemo(() => {
      const t = lessonType.toLowerCase();
      if (t.includes('audio')) return true;
      if (t.includes('video')) return false;
      return /\.(mp3|m4a|aac|wav|ogg)(\?.*)?$/i.test(mediaUrl);
    }, [lessonType, mediaUrl]);

    React.useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    const unloadAudio = async () => {
      const s = soundRef.current;
      soundRef.current = null;
      setAudioLoaded(false);
      setAudioPlaying(false);
      setAudioPositionSec(0);
      setAudioDurationSec(0);
      if (!s) return;
      try {
        await s.stopAsync();
      } catch {
        // ignore
      }
      try {
        await s.unloadAsync();
      } catch {
        // ignore
      }
    };

    const handleClose = () => {
      unloadAudio().catch(() => null);
      videoRef.current?.pauseAsync().catch(() => null);
      onClose?.();
    };

    useEffect(() => {
      // Ensure previous audio is torn down when switching lessons/types.
      unloadAudio().catch(() => null);
      if (!lesson || !mediaUrl || !isAudio) return;

      let cancelled = false;

      (async () => {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });

          const { sound: created } = await Audio.Sound.createAsync(
            { uri: mediaUrl },
            { shouldPlay: true },
            (status: AVPlaybackStatus) => {
              if (!status.isLoaded) return;
              setAudioLoaded(true);
              setAudioPlaying(status.isPlaying);
              setAudioPositionSec(status.positionMillis / 1000);
              setAudioDurationSec((status.durationMillis ?? 0) / 1000);
            }
          );

          if (cancelled) {
            await created.unloadAsync();
            return;
          }

          soundRef.current = created;
        } catch {
          toast.error('Unable to play this lesson.');
        }
      })();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson?.documentId, mediaUrl, isAudio]);

    const toggleAudio = async () => {
      const s = soundRef.current;
      if (!s) return;
      const status = await s.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await s.pauseAsync();
      } else {
        await s.playAsync();
      }
    };

    return (
      <BaseModal ref={modalRef} onClose={handleClose} {...props}>
        <BottomSheetView style={styles.content}>
          <View style={[flexBetween, styles.header]}>
            <TextHeading variant="title" numberOfLines={2}>
              {lesson?.title ?? 'Lesson'}
            </TextHeading>

            <IconButton
              onPress={() => dismiss()}
              icon="close"
              iconType="antd"
              size="sm"
              backgroundColor={colors.primary_light}
              style={globalStyles.border_dashed}
            />
          </View>

          <Spacer height={themeToken.spacing} />

          {!lesson ? (
            <View style={styles.centered}>
              <TextBody variant="body2" color="secondary">
                Select a lesson to play.
              </TextBody>
            </View>
          ) : !mediaUrl ? (
            <View style={styles.centered}>
              <TextBody variant="body2" color="secondary" style={globalStyles.text_center}>
                This lesson doesn’t have a playable media URL yet.
              </TextBody>
            </View>
          ) : isAudio ? (
            <ThemedView style={styles.audioCard}>
              <View style={[flexBetween, globalStyles.p_md]}>
                <TextBody variant="body2" color="secondary">
                  {audioLoaded ? `${formatTime(audioPositionSec)} / ${formatTime(audioDurationSec)}` : 'Loading…'}
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
              <Video
                ref={videoRef}
                style={styles.video}
                source={{ uri: mediaUrl }}
                useNativeControls
                shouldPlay
                resizeMode={ResizeMode.CONTAIN}
              />
            </ThemedView>
          )}
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

