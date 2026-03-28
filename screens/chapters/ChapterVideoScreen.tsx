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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { centered, flexBetween, globalStyles } from '@/utils/styles';
import { useChapterByDocumentId, useChapterVideo } from '@/hooks/useLessons';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';

const ChapterVideoScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ chapterId: string; lessonId?: string }>();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : '';
  const { chapter, isLoading: isChapterLoading, error: chapterError, refetch: chapterRefetch } = useChapterByDocumentId(chapterId);
  const { chapterVideo, isLoading: isVideoLoading, error: videoError, refetch: videoRefetch } = useChapterVideo(chapterId);

  const isLoading = isChapterLoading || isVideoLoading;
  const error = chapterError ?? videoError;

  const refetch = useCallback(() => {
    chapterRefetch();
    videoRefetch();
  }, [chapterRefetch, videoRefetch]);

  const videoUrl = useMemo(() => getChapterVideoUrl(chapterVideo ?? null), [chapterVideo]);
  const offlineVideoUri = useOfflineAssetUri(videoUrl);
  const videoPlayer = useVideoPlayer(videoUrl);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);

  useEffect(() => {
    const sub = videoPlayer.addListener('statusChange', ({ status, error, oldStatus }) => {
      console.log({ status, error, oldStatus });
      if (status === 'error') setVideoPlaybackError(true);
    });
    return () => sub.remove();
  }, [videoPlayer]);

  useEffect(() => {
    if (!offlineVideoUri) return;
    videoPlayer.play();
  }, [offlineVideoUri, videoPlayer]);

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
        subtitle="Videwo"
        onBack={router.back}
        title={chapter?.title ?? 'Igice'}
        audioUrl={chapter?.audio_desc?.url}
        thumbnailUrl={chapter?.thumbnail?.url}
      />
      <View style={[globalStyles.flex_1, { paddingBottom: insets.bottom }]}>
        {isLoading ? <View style={[centered, globalStyles.flex_1]}> <Loader color="primary" size="large" /> </View> : offlineVideoUri ? (
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

