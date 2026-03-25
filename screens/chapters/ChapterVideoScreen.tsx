import { ThemedView } from '@/components/themed-view';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';
import Button from '@/components/buttons/button';
import { TextBody, TextHeading } from '@/components/typography';
import { useChapterByDocumentId, useChapterVideo } from '@/hooks/useLessons';
import { centered, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getChapterVideoUrl } from './chapterVideo';
import Loader from '@/components/loader';

const ChapterVideoScreen = () => {
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

  const videoRef = useRef<Video>(null);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);

  useEffect(() => {
    setVideoPlaybackError(false);
  }, [videoUrl]);

  if (!chapterId) return <ThemedView style={[styles.container, globalStyles.center]} />;

  if (error || videoPlaybackError) {
    return (
      <ThemedView style={[styles.container, globalStyles.center]}>
        <TextBody variant="body2" strong>
          Failed to load chapter video.
        </TextBody>
        <Pressable onPress={refetch} style={globalStyles.mt_sm}>
          <TextBody variant="body2" color="primary">
            Retry
          </TextBody>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ContentThumbnailHeader
        onBack={router.back}
        title={chapter?.title ?? 'Chapter'}
        subtitle="Video"
        thumbnailUrl={chapter?.thumbnail?.url}
        audioUrl={chapter?.audio_desc?.url}
      />
      <View style={globalStyles.flex_1}>
        {isLoading ? <View style={[centered, globalStyles.flex_1]}> <Loader color="primary" size="large" /> </View> : videoUrl ? (
          <Video
            ref={videoRef}
            useNativeControls
            style={styles.video}
            source={{ uri: videoUrl }}
            resizeMode={ResizeMode.CONTAIN}
            onError={() => setVideoPlaybackError(true)}
            onLoad={() => videoRef.current?.playAsync()}
          />
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

