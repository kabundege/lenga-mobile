import Loader from '../loader';
import { PressableScale } from 'pressto';
import colors from '@/utils/theme/colors';
import { useEffect, useState } from 'react';
import IconButton from '../buttons/iconButton';
import { themeToken } from '@/utils/theme/styles';
import { Image, StyleSheet, View } from 'react-native';
import { useQAByDocumentId } from '@/hooks/useLessons';
import { useLessonAudio } from '@/hooks/useLessonAudio';
import PlayAudioButton from '../buttons/playAudioButton';
import { Dimensions, globalStyles } from '@/utils/styles';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CORRECT_ANSWER_AUDIO_URL, WRONG_ANSWER_AUDIO_URL } from '@/screens/chapters/matching/constants';

export type QuizQACardRevealState = 'idle' | 'correct' | 'wrong' | 'unknown';

type QuizQACardProps = {
  qaId: string;
  rightAnswerCallBack: () => void;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

const QuizQACard = ({ qaId, rightAnswerCallBack }: QuizQACardProps) => {
  const opacity = useSharedValue(1);
  const { qa } = useQAByDocumentId(qaId);
  const [selected, setSelected] = useState(false);
  const thumbnailUrl = useOfflineAssetUri(qa?.thumbnail?.url);

  const {
    audioLoaded: correctAudioLoaded,
    toggleAudio: toggleCorrectAnswerAudio,
  } = useLessonAudio(CORRECT_ANSWER_AUDIO_URL);

  const {
    audioLoaded: wrongAudioLoaded,
    toggleAudio: toggleWrongAnswerAudio,
  } = useLessonAudio(WRONG_ANSWER_AUDIO_URL);

  const onPress = () => {
    if (selected) return;
    setSelected(true);
    if (qa?.is_correct_answer) {
      rightAnswerCallBack();
      if (correctAudioLoaded) {
        // Play correct answer audio
        toggleCorrectAnswerAudio();
      }
      return;
    }
    if (wrongAudioLoaded) {
      // Play wrong answer audio
      toggleWrongAnswerAudio();
    }
  }

  useEffect(() => {
    if (selected) {
      opacity.value = withTiming(0.5);
    }
  }, [selected]);

  const ImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  if (!qa) return <Loader />;

  return (
    <PressableScale
      onPress={onPress}
      enabled={!selected}
      style={globalStyles.w_50}
    >
      <AnimatedImage
        source={{ uri: thumbnailUrl }}
        style={[styles.thumbnail, ImageAnimatedStyle]}
      />
      <PlayAudioButton styles={globalStyles.border_secondary} audioUrl={qa.audio_desc.url} style={styles.audioButton} backgroundColor={colors.background.tertiary} />
      {selected ? (
        <View style={styles.selectBtn}>
          <IconButton
            backgroundColor={qa.is_correct_answer ? colors.success.tertiary : colors.danger.light}
            iconFill={qa.is_correct_answer ? colors.success.primary : colors.text.danger}
            icon={qa?.is_correct_answer ? "check" : "close"}
            style={globalStyles.self_start}
            size="lg"
          />
        </View>
      ) : null}
    </PressableScale>
  );
};

export default QuizQACard;

const CARD_WIDTH = Dimensions.SCREEN_WIDTH * 0.35;
const CARD_HEIGHT = CARD_WIDTH + Dimensions.FONT_SIZE_L;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: themeToken.borderRadius,
    padding: themeToken.padding,
  },
  audioButton: {
    position: 'absolute',
    bottom: -CARD_HEIGHT * 0.1,
    left: (CARD_WIDTH - Dimensions.FONT_SIZE_L) * 0.7,
  },
  thumbnail: {
    height: CARD_WIDTH,
    resizeMode: 'contain',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_05,
  },
  pill: {
    position: 'absolute',
    left: themeToken.paddingSm,
    bottom: themeToken.paddingSm,
    paddingHorizontal: themeToken.paddingSm,
    paddingVertical: themeToken.paddingSm,
    borderRadius: 999,
    ...globalStyles.overflow_hidden,
  },
  selectBtn: StyleSheet.flatten([
    {
      top: "20%",
      left: (CARD_WIDTH - Dimensions.FONT_SIZE_L) * 0.65,
    },
    globalStyles.absolute,
    globalStyles.rounded_lg,
    globalStyles.bg_background,
  ])
});

