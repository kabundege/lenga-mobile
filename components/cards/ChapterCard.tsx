import { TextBody, TextHeading } from '@/components/typography';
import ThumbnailWithOverlay from '@/components/common/ThumbnailWithOverlay';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { useChapterByDocumentId, useChapterMatchings, useChapterVideo } from '@/hooks/useLessons';
import { StrapiLessonChapter } from '@/types/api';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import colors from '@/utils/theme/colors';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from 'pressto';
import PlayAudioButton from '../buttons/playAudioButton';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { CHAPTER_CARD_WIDTH } from '@/screens/lessons/lessonLayout';
import IconButton from '../buttons/iconButton';
import { router } from 'expo-router';

interface ChapterCardProps {
  height: number;
  chapter: StrapiLessonChapter;
}

const ChapterCard = ({ chapter: embeddedChapter, height }: ChapterCardProps) => {
  const cardHeight = useSharedValue(Dimensions.SCREEN_HEIGHT * 0.7);
  useEffect(() => {
    cardHeight.value = withTiming(height);
  }, [height]);

  const chapterId = embeddedChapter.documentId;
  const { chapter: fullChapter } = useChapterByDocumentId(chapterId);
  const { chapterVideo } = useChapterVideo(chapterId);
  const { chapterMatchings } = useChapterMatchings(chapterId);
  const chapter = fullChapter ?? embeddedChapter;
  const thumbnailUrl = useOfflineAssetUri(chapter.thumbnail?.url);
  const quizzesCount = chapter.quizzes?.length ?? 0;
  const matchingsCount = chapterMatchings.length;

  const animatedStyles = useAnimatedStyle(() => ({
    marginRight: Dimensions.SIZE_M,
    height: withTiming(cardHeight.value),
  }));

  return (
    <PressableScale
      onPress={() => router.push(`/lessons/chapters/${chapterId}/${chapterVideo ? 'video' : matchingsCount > 0 ? 'matching' : 'quiz'}`)}
      style={animatedStyles}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={globalStyles.w_80}>
            <TextBody variant="body1" color="secondary">Intambwe ya {chapter.order}</TextBody>
            <TextHeading variant="heading" numberOfLines={2}>
              {chapter.title}
            </TextHeading>
          </View>
          <PlayAudioButton audioUrl={chapter.audio_desc?.url} />
        </View>

        <ThumbnailWithOverlay
          overlayStyle={styles.overlay}
          imageStyle={styles.thumbnail}
          uri={thumbnailUrl}
        />

        <View style={[globalStyles.flex_col, globalStyles.gap_xs]}>
          <View style={[globalStyles.self_start, flexBetween, globalStyles.gap_xs]}>
            {quizzesCount || chapterVideo ? (
              <IconButton
                icon={chapterVideo ? 'videocam' : 'edit-3'}
                iconType={chapterVideo ? 'ionicons' : 'feather'}
                backgroundColor={colors.primary}
                iconFill={colors.text.inverted}
              />
            ) : matchingsCount > 0 ? (
              <IconButton
                icon="link"
                iconType="feather"
                backgroundColor={colors.pink}
                iconFill={colors.text.inverted}
              />
            ) : null}
            <TextBody
              variant="body1"
              color={quizzesCount || chapterVideo ? 'default' : 'secondary'}
              style={globalStyles.text_md}
            >
              {chapterVideo
                ? 'Reba Video'
                : quizzesCount
                  ? `Imyitozi ${quizzesCount}`
                  : matchingsCount > 0
                    ? `Guhuza ${matchingsCount}`
                    : 'Nta Mwitozo wabonetse'}
            </TextBody>
          </View>

        </View>
      </View>
    </PressableScale>
  );
};

export default ChapterCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    height: '100%',
    width: CHAPTER_CARD_WIDTH,
    padding: themeToken.padding,
    justifyContent: 'space-between',
    ...globalStyles.overflow_hidden,
    borderColor: colors.border.tertiary,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.primary_light,
  },
  header: {
    ...StyleSheet.flatten(flexBetween),
    ...globalStyles.mb_xs,
    zIndex: 10,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_05,
  },
});
