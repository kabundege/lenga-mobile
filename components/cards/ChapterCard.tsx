import { TextBody, TextHeading } from '@/components/typography';
import ThumbnailWithOverlay from '@/components/common/ThumbnailWithOverlay';
import { useChapterByDocumentId } from '@/hooks/useLessons';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import colors from '@/utils/theme/colors';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from 'pressto';
import { getImageUrl } from '@/utils/functions/env';
import PlayAudioButton from '../buttons/playAudioButton';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { CHAPTER_CARD_WIDTH } from '@/screens/lessons/LessonDetailScreen';
import IconButton from '../buttons/iconButton';

interface ChapterCardProps {
  height: number;
  chapterId: string;
  onPress: () => void;
}

const ChapterCard = ({ chapterId, onPress, height }: ChapterCardProps) => {
  const cardHeight = useSharedValue(0);
  useEffect(() => {
    cardHeight.value = withTiming(height);
  }, [height]);
  const { chapter } = useChapterByDocumentId(chapterId);
  const quizzesCount = chapter?.quizzes?.length ?? 0;

  const animatedStyles = useAnimatedStyle(() => ({
    paddingRight: Dimensions.SIZE_M,
    height: withTiming(cardHeight.value),
  }));

  return (
    <PressableScale
      onPress={onPress}
      style={animatedStyles}
    >
      <View style={[styles.card]}>
        <View style={[flexBetween, globalStyles.mb_xs]}>
          <View style={globalStyles.w_80}>
            <TextBody variant="body1" color="secondary">Intambwe ya {chapter?.order}</TextBody>
            <TextHeading variant="heading" numberOfLines={2}>
              {chapter?.title}
            </TextHeading>
          </View>
          <PlayAudioButton
            audioUrl={chapter?.audio_desc?.url}
          />
        </View>
        <ThumbnailWithOverlay
          overlayStyle={styles.overlay}
          imageStyle={styles.thumbnail}
          uri={getImageUrl(chapter?.thumbnail?.url)}
        />
        <View style={[globalStyles.self_start, flexBetween, globalStyles.gap_xs]}>
          {
            quizzesCount ? (
              <IconButton icon="edit-3" iconType="feather" backgroundColor={colors.primary} iconFill={colors.text.inverted} />
            ) : null
          }
          <TextBody variant="body1" color={quizzesCount ? "default" : "secondary"} style={globalStyles.text_md}>{quizzesCount ? 'Imyitozi' : 'Nta Mwitozo wabonetse'} {quizzesCount ?? ''} </TextBody>
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
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_05,
  },
});
