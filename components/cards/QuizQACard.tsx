import { useLessonAudio } from "@/hooks/useLessonAudio";
import { useQAByDocumentId } from "@/hooks/useLessons";
import { useOfflineAssetUri } from "@/hooks/useOfflineAssetUri";
import {
  CORRECT_ANSWER_AUDIO_URL,
  WRONG_ANSWER_AUDIO_URL,
} from "@/screens/chapters/matching/constants";
import type { StrapiQA } from "@/types/api";
import { Dimensions, globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import { PressableScale } from "pressto";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import IconButton from "../buttons/iconButton";
import PlayAudioButton from "../buttons/playAudioButton";
import Loader from "../loader";

export type QuizQACardRevealState = "idle" | "correct" | "wrong" | "unknown";

type QuizQACardProps = {
  /** When set, used for render (e.g. QA nested on quiz). List cache is still a fallback. */
  qa?: StrapiQA | null;
  qaId?: string;
  rightAnswerCallBack?: () => void;
  isContextOnly?: boolean;
  contextThumbnailUrl?: string | null;
  contextAudioUrl?: string | null;
  contextDescription?: string | null;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

const QuizQACard = ({
  qa: qaProp,
  qaId,
  rightAnswerCallBack,
  isContextOnly = false,
  contextThumbnailUrl,
  contextAudioUrl,
  contextDescription,
}: QuizQACardProps) => {
  const opacity = useSharedValue(1);
  const qaDocId = qaProp?.documentId ?? qaId ?? "";
  const { qa: qaFromCache } = useQAByDocumentId(qaDocId);
  const qa = useMemo((): StrapiQA | null => {
    const a = qaFromCache ?? null;
    const b = qaProp ?? null;
    if (!a && !b) return null;
    if (!a) return b;
    if (!b) return a;
    return {
      ...a,
      ...b,
      thumbnail: b.thumbnail ?? a.thumbnail,
      audio_desc: b.audio_desc ?? a.audio_desc,
    };
  }, [qaProp, qaFromCache]);
  const [selected, setSelected] = useState(false);
  const thumbnailUrl = useOfflineAssetUri(qa?.thumbnail?.url);
  const contextThumbnail = useOfflineAssetUri(contextThumbnailUrl);

  const {
    audioLoaded: correctAudioLoaded,
    toggleAudio: toggleCorrectAnswerAudio,
  } = useLessonAudio(CORRECT_ANSWER_AUDIO_URL);

  const { audioLoaded: wrongAudioLoaded, toggleAudio: toggleWrongAnswerAudio } =
    useLessonAudio(WRONG_ANSWER_AUDIO_URL);

  const onPress = () => {
    if (isContextOnly || selected) return;
    setSelected(true);
    if (qa?.is_correct_answer) {
      rightAnswerCallBack?.();
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
  };

  useEffect(() => {
    if (selected) {
      opacity.value = withTiming(0.5);
    }
  }, [selected]);

  const ImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (isContextOnly) {
    return (
      <View style={[globalStyles.w_50, globalStyles.mx_auto]}>
        <AnimatedImage
          source={{ uri: contextThumbnail }}
          style={[styles.thumbnail, ImageAnimatedStyle]}
        />
        <PlayAudioButton
          style={styles.audioButton}
          audioUrl={contextAudioUrl ?? ""}
          styles={globalStyles.border_secondary}
          backgroundColor={colors.background.tertiary}
        />
      </View>
    );
  }

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
      <PlayAudioButton
        styles={globalStyles.border_secondary}
        audioUrl={qa.audio_desc?.url ?? ""}
        style={styles.audioButton}
        backgroundColor={colors.background.tertiary}
      />
      {selected ? (
        <View style={styles.selectBtn}>
          <IconButton
            backgroundColor={
              qa.is_correct_answer
                ? colors.success.tertiary
                : colors.danger.light
            }
            iconFill={
              qa.is_correct_answer ? colors.success.primary : colors.text.danger
            }
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
  contextCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: themeToken.borderRadius,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    padding: themeToken.padding,
  },
  contextImage: {
    width: "100%",
    height: CARD_WIDTH,
  },
  contextDescription: {
    marginTop: themeToken.spacingSm,
    color: colors.text.default,
  },
  contextAudioButton: {
    marginTop: themeToken.spacingSm,
    alignSelf: "flex-start",
  },
  card: {
    borderWidth: 1,
    borderRadius: themeToken.borderRadius,
    padding: themeToken.padding,
  },
  audioButton: {
    position: "absolute",
    bottom: -CARD_HEIGHT * 0.1,
    left: (CARD_WIDTH - Dimensions.FONT_SIZE_L) * 0.7,
  },
  thumbnail: {
    height: CARD_WIDTH,
    resizeMode: "contain",
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_05,
  },
  pill: {
    position: "absolute",
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
  ]),
});
