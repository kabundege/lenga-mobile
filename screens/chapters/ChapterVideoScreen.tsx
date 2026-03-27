import colors from '@/utils/theme/colors';
import Loader from '@/components/loader';
import { themeToken } from '@/utils/theme/styles';
import { getChapterVideoUrl } from './chapterVideo';
import { ThemedView } from '@/components/themed-view';
import { useVideoPlayer, VideoView } from 'expo-video';
import { centered, globalStyles } from '@/utils/styles';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { TextBody } from '@/components/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const videoPlayer = useVideoPlayer(offlineVideoUri || null);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);

  useEffect(() => {
    setVideoPlaybackError(false);
  }, [videoUrl]);

  useEffect(() => {
    const sub = videoPlayer.addListener('statusChange', ({ status }) => {
      if (status === 'error') setVideoPlaybackError(true);
    });
    return () => sub.remove();
  }, [videoPlayer]);

  useEffect(() => {
    if (!offlineVideoUri) return;
    videoPlayer.play();
  }, [offlineVideoUri, videoPlayer]);

  if (!chapterId) return <ThemedView style={[styles.container, globalStyles.center]} />;

  if (error || videoPlaybackError) {
    return (
      <ThemedView style={[styles.container, globalStyles.center]}>
        <TextBody variant="body2" strong>
          Ntibyashobotse gufungura videwo y'igice.
        </TextBody>
        <Pressable onPress={refetch} style={globalStyles.mt_sm}>
          <TextBody variant="body2" color="primary">
            Ongera ugerageze
          </TextBody>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ContentThumbnailHeader
        onBack={router.back}
        title={chapter?.title ?? 'Igice'}
        subtitle="Videwo"
        thumbnailUrl={chapter?.thumbnail?.url}
        audioUrl={chapter?.audio_desc?.url}
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

