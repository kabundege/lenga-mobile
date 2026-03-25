import PlayAudioButton from '@/components/buttons/playAudioButton';
import ThumbnailWithOverlay from '@/components/common/ThumbnailWithOverlay';
import { useLessonAudio } from '@/hooks/useLessonAudio';
import type { StrapiLesson } from '@/types/api';
import { getImageUrl } from '@/utils/functions/env';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';
import { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { TextBody, TextHeading } from '../typography';

interface LessonCardProps {
  index: number;
  lesson: StrapiLesson;
  style?: StyleProp<ViewStyle>;
}

const LessonCard = ({ index, lesson, style }: LessonCardProps) => {
  const thumbnailUrl = useMemo(() => getImageUrl(lesson.thumbnail?.url ?? ''), [lesson.thumbnail?.url]);

  const stylesAnimated = useAnimatedStyle(() => ({
    marginLeft: withTiming(index % 2 === 0 ? 0 : cardSpacing),
  }));

  return (
    <PressableScale
      entering={FadeInDown.delay(index * 100)}
      style={[styles.card, stylesAnimated, style]}
      onPress={() => router.push(`/lessons/${lesson.documentId}`)}
    >
      <ThumbnailWithOverlay
        uri={thumbnailUrl}
        overlayStyle={styles.overlay}
        imageStyle={StyleSheet.absoluteFillObject}
      />
      <View style={flexBetween}>
        <TextBody variant='body1' >Intambwe ya {index + 1}</TextBody>
        <PlayAudioButton
          size='sm'
          audioUrl={lesson.audio_desc?.url}
        />
      </View>
      <View style={globalStyles.flex_1} />
      <TextHeading variant='subTitle'>{lesson.title}</TextHeading>
    </PressableScale >
  );
};

export default LessonCard;

const cardSpacing = themeToken.spacing;
const listPadding = themeToken.paddingLg * 2;
const cardWidth = (Dimensions.SCREEN_WIDTH - listPadding - cardSpacing) * 0.5;
const cardHeight = Dimensions.SCREEN_HEIGHT * 0.3;

const styles = StyleSheet.create({
  card: StyleSheet.flatten([
    globalStyles.p_md,
    globalStyles.rounded_md,
    globalStyles.overflow_hidden,
    globalStyles.border_tertiary,
    globalStyles.overflow_hidden,
    {
      backgroundColor: colors.background.tertiary,
      width: cardWidth,
      height: cardHeight,
    },
  ]),
  overlay: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_05,
  },
});
