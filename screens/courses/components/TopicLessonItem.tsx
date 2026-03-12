import IconButton from '@/components/buttons/iconButton';
import Chip from '@/components/common/chip';
import { LessonPlayerModal } from '@/components/modals';
import { TextBody } from '@/components/typography';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { downloadLessonMedia } from '@/store/slices/offlineMediaSlice';
import { confirm } from '@/utils/functions/confirm';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { PressableOpacity } from 'pressto';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { CurvedTransition, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import type { TopicLessonItemProps } from './CourseTopicsList.types';
import { getLessonMediaUrl } from './courseLessonUtils';

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

export function TopicLessonItem({ lesson, index }: TopicLessonItemProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entry = useAppSelector((s) => s.offlineMedia.byLessonId[lesson.documentId]);
  const isDownloaded = entry?.status === 'saved' && !!entry.localUri;
  const isSaving = entry?.status === 'saving';
  const bytesWritten = entry?.bytesWritten ?? 0;
  const totalBytes = entry?.totalBytes ?? null;
  const mediaUrl = useMemo(() => getLessonMediaUrl(lesson), [lesson]);

  const percent = useMemo(() => {
    if (!isSaving || !totalBytes || totalBytes <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((bytesWritten / totalBytes) * 100)));
  }, [isSaving, bytesWritten, totalBytes]);

  const onDownloadPress = useCallback(async () => {
    if (!mediaUrl || isDownloaded || isSaving) return;
    const confirmed = await confirm({
      title: t('courses.saveOfflineConfirmTitle'),
      message: t('courses.saveOfflineConfirmMessage'),
      confirmText: t('global.buttons.confirm'),
      cancelText: t('global.buttons.cancel'),
    });
    if (!confirmed) return;
    dispatch(downloadLessonMedia({ lessonId: lesson.documentId, remoteUrl: mediaUrl }))
      .unwrap()
      .then(() => toast.success(t('courses.savedForOffline')))
      .catch(() => toast.error(t('courses.downloadFailed')));
  }, [dispatch, lesson.documentId, mediaUrl, isDownloaded, isSaving, t]);

  const icon = !mediaUrl
    ? 'error'
    : isSaving
      ? 'loading1'
      : isDownloaded
        ? 'play'
        : 'download';
  const iconType = !mediaUrl ? 'materialIcons' : isSaving ? 'antd' : isDownloaded ? 'ionicons' : 'material';

  return (
    <LessonPlayerModal
      lesson={lesson}
      toggleBtn={
        ({ onPress }) => (
          <PressableOpacity
            onPress={onPress}
            entering={FadeInDown.delay(index * 100)}
            exiting={FadeOutUp.delay(index * 100)}
            layout={CurvedTransition}
            style={[flexBetween, globalStyles.p_sm, globalStyles.bg_background]}
          >
            <View style={styles.textBlock}>
              <TextBody variant="body2">{lesson.title}</TextBody>
              <View
                style={[
                  globalStyles.flex_row,
                  globalStyles.gap_xs,
                  globalStyles.items_center,
                  globalStyles.flex_wrap,
                ]}
              >
                <TextBody
                  style={[globalStyles.uppercase, globalStyles.font_500]}
                  variant="caption"
                  color="primary"
                >
                  {lesson.lesson_type} &middot; {lesson.locale}
                </TextBody>
                <Chip
                  size="xs"
                  variant="filled"
                  style={isDownloaded ? globalStyles.bg_green_light : undefined}
                  label={isDownloaded ? t('courses.courseSaved') : t('courses.courseNotSaved')}
                />
              </View>
            </View>
            <View style={styles.downloadBlock}>
              {isSaving && (
                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: percent != null ? `${percent}%` : '0%',
                        },
                      ]}
                    />
                  </View>
                  <TextBody variant="caption" color="secondary" style={styles.progressText}>
                    {percent != null
                      ? `${percent}%`
                      : `${formatBytes(bytesWritten)}`}
                  </TextBody>
                </View>
              )}
              <IconButton
                icon={icon}
                iconType={iconType}
                iconFill={colors.primary}
                backgroundColor={colors.primary_light}
                onPress={onDownloadPress}
                disabled={!mediaUrl || isDownloaded || isSaving}
                size="sm"
              />
            </View>
          </PressableOpacity>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  downloadBlock: {
    alignItems: 'flex-end',
    gap: themeToken.spacing / 2,
  },
  progressWrap: {
    alignItems: 'flex-end',
    minWidth: 56,
  },
  progressTrack: {
    height: 4,
    width: 56,
    backgroundColor: colors.background.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    marginTop: 2,
  },
});
