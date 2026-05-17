import Loader from '@/components/loader';
import colors from '@/utils/theme/colors';
import { StyleSheet, View } from 'react-native';
import Button from '@/components/buttons/button';
import { themeToken } from '@/utils/theme/styles';
import { TextBody } from '@/components/typography';
import { getChapterVideoUrl } from './chapterVideo';
import { ThemedView } from '@/components/themed-view';
import { useVideoPlayer, VideoView } from 'expo-video';
import IconButton from '@/components/buttons/iconButton';
import { router, useLocalSearchParams } from 'expo-router';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { useNetworkStatus } from '@/components/providers/NetworkProvider';
import { playbackRequiresNetwork } from '@/utils/playbackConnectivity';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { centered, flexBetween, globalStyles } from '@/utils/styles';
import { useChapterByDocumentId, useChapterVideo, useLessonForChapter } from '@/hooks/useLessons';
import { useTranslation } from 'react-i18next';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';

const ChapterVideoScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ chapterId: string; lessonId?: string }>();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : '';
  const { lesson } = useLessonForChapter(chapterId);
  const { chapter, isLoading: isChapterLoading, error: chapterError, refetch: chapterRefetch } = useChapterByDocumentId(chapterId);
  const { chapterVideo, isLoading: isVideoLoading, error: videoError, refetch: videoRefetch } = useChapterVideo(chapterId);

  const isLoading = isChapterLoading || isVideoLoading;
  const error = chapterError ?? videoError;
  const { isOffline } = useNetworkStatus();

  const refetch = useCallback(() => {
    chapterRefetch();
    videoRefetch();
  }, [chapterRefetch, videoRefetch]);

  const videoUrl = useMemo(() => getChapterVideoUrl(chapterVideo ?? null), [chapterVideo]);
  const resolvedVideoUri = useOfflineAssetUri(videoUrl);
  const playbackBlockedOffline = Boolean(
    resolvedVideoUri && isOffline && playbackRequiresNetwork(resolvedVideoUri),
  );
  const videoSourceUri = playbackBlockedOffline ? null : (resolvedVideoUri || null);
  const videoPlayer = useVideoPlayer(videoSourceUri);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);

  const breadcrumbItems = useMemo(
    () => [
      lesson?.title ?? t('lessons.lessonTitleFallback'),
      chapter?.title ?? t('lessons.chapterTitleFallback'),
      t('lessons.breadcrumb.video'),
    ],
    [lesson?.title, chapter?.title, t],
  );

  useEffect(() => {
    const sub = videoPlayer.addListener('statusChange', ({ status }) => {
      if (status === 'error') setVideoPlaybackError(true);
    });
    return () => sub.remove();
  }, [videoPlayer]);

  useEffect(() => {
    if (!videoSourceUri || playbackBlockedOffline) return;
    videoPlayer.play();
  }, [playbackBlockedOffline, videoPlayer, videoSourceUri]);

  if (!chapterId || isLoading) return <ThemedView style={[styles.container, globalStyles.center]}> <Loader color="primary" size="large" /> </ThemedView>;

  if (error || videoPlaybackError) {
    return (
      <ThemedView style={[styles.container, globalStyles.center]}>
        <TextBody variant="body2" strong>
          Ntibyashobotse gufungura videwo.
        </TextBody>
        <View style={[flexBetween, globalStyles.w_50]}>
          <IconButton icon="chevron-left" onPress={router.back} backgroundColor={colors.primary_light} iconFill={colors.text.primary} style={globalStyles.rounded_sm} />
          <Button
            size='md'
            type='secondary'
            onPress={refetch}
            label="Ongera ugerageze"
            textColor={colors.text.primary}
            overRiddingStyles={[globalStyles.bg_transparent, globalStyles.flex_shrink]}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ContentThumbnailHeader
        breadcrumbItems={breadcrumbItems}
        subtitle="Videwo"
        onBack={router.back}
        title={chapter?.title ?? 'Igice'}
        audioUrl={chapter?.audio_desc?.url}
        thumbnailUrl={chapter?.thumbnail?.url}
      />
      <View style={[globalStyles.flex_1, { paddingBottom: insets.bottom }]}>
        {playbackBlockedOffline ? (
          <View style={[centered, globalStyles.flex_1]}>
            <TextBody variant="body2" color="secondary" style={globalStyles.text_center}>
              {t('lessons.offlinePlaybackNeedsConnection')}
            </TextBody>
          </View>
        ) : resolvedVideoUri ? (
          <VideoView player={videoPlayer} nativeControls style={styles.video} contentFit="contain" />
        ) : null}
      </View>
    </ThemedView>
  );
};

export default ChapterVideoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: themeToken.paddingLg,
    paddingVertical: themeToken.paddingLg,
  },
  card: {
    padding: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
