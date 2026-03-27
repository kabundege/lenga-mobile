import { type StrapiMatchingAnswer } from '@/types/api';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { Image, StyleSheet, View } from 'react-native';
import { useRef, useCallback } from 'react';
import Animated, { useAnimatedStyle, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import IconButton from '../buttons/iconButton';
import { CARD_SIZE, type AnswerLayout } from './MatchingQuestionCard';

type Props = {
  answer: StrapiMatchingAnswer;
  isMatched: boolean;
  hoveredAnswerId: SharedValue<string>;
  onRegisterLayout: (answerId: string, layout: AnswerLayout) => void;
};

const MatchingAnswerCard = ({ answer, isMatched, hoveredAnswerId, onRegisterLayout }: Props) => {
  const thumbUri = useOfflineAssetUri(answer.thumbnail?.url);
  const viewRef = useRef<View>(null);
  const answerId = answer.documentId;

  const handleLayout = useCallback(() => {
    setTimeout(() => {
      viewRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          onRegisterLayout(answerId, { x, y, width, height });
        }
      });
    }, 150);
  }, [answerId, onRegisterLayout]);

  // Runs entirely on the UI thread — smooth haze effect with no JS-bridge round-trip
  const hoverStyle = useAnimatedStyle(() => {
    const isHovered = !isMatched && hoveredAnswerId.value === answerId;
    return {
      borderColor: withTiming(
        isHovered ? colors.primary : colors.border.primary,
        { duration: 120 },
      ),
      borderWidth: withTiming(isHovered ? 2.5 : 1.5, { duration: 120 }),
      backgroundColor: withTiming(
        isHovered ? colors.primary_light : colors.background.secondary,
        { duration: 120 },
      ),
      transform: [
        { scale: withSpring(isHovered ? 1.06 : 1, { damping: 14, stiffness: 260 }) },
      ],
    };
  });

  return (
    <Animated.View
      ref={viewRef}
      onLayout={handleLayout}
      style={[styles.card, isMatched && styles.cardMatched, hoverStyle]}
    >
      {thumbUri ? (
        <Image source={{ uri: thumbUri }} style={styles.thumb} resizeMode="contain" />
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}
      {isMatched ? (
        <View style={styles.badge}>
          <IconButton
            icon="check"
            size="sm"
            backgroundColor={colors.success.tertiary}
            iconFill={colors.success.primary}
            style={globalStyles.self_start}
          />
        </View>
      ) : null}

      {/* Haze overlay — sits on top of the image, fades in when hovered */}
      <HazeOverlay hoveredAnswerId={hoveredAnswerId} answerId={answerId} isMatched={isMatched} />
    </Animated.View>
  );
};

// Separated so the animated style is isolated to just this element
const HazeOverlay = ({
  hoveredAnswerId,
  answerId,
  isMatched,
}: {
  hoveredAnswerId: SharedValue<string>;
  answerId: string;
  isMatched: boolean;
}) => {
  const overlayStyle = useAnimatedStyle(() => {
    const isHovered = !isMatched && hoveredAnswerId.value === answerId;
    return {
      opacity: withTiming(isHovered ? 1 : 0, { duration: 120 }),
    };
  });

  return <Animated.View style={[StyleSheet.absoluteFillObject, styles.hazeOverlay, overlayStyle]} />;
};

export default MatchingAnswerCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1.5,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMatched: {
    borderColor: colors.success.primary,
    backgroundColor: colors.success.tertiary,
  },
  thumb: {
    width: '90%',
    height: '90%',
  },
  thumbPlaceholder: {
    width: '90%',
    height: '90%',
    backgroundColor: colors.background.tertiary,
    borderRadius: themeToken.borderRadius,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  hazeOverlay: {
    backgroundColor: colors.primary_light,
    borderRadius: themeToken.borderRadius,
  },
});
