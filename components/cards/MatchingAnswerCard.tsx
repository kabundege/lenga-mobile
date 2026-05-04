import { type StrapiMatchingAnswer, type StrapiMatchingQuestion } from '@/types/api';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { Image, StyleSheet, View } from 'react-native';
import { useRef, useCallback, useMemo } from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import IconButton from '../buttons/iconButton';
import { CARD_SIZE, type AnswerLayout, type AnswerPositionEntry } from './MatchingQuestionCard';

type Props = {
  answer: StrapiMatchingAnswer;
  isMatched: boolean;
  /** Green check + matched card styling — only for strict CMS pairs on this slot (hidden for wildcard-only matches). */
  showMatchedCheck?: boolean;
  /** Red X on wrong overlay; false on wildcard boards. */
  showWrongCheck?: boolean;
  /** Strong wrong border on the answer card. */
  emphasizeWrongCard?: boolean;
  /** Questions correctly dropped on this answer (can be several per bucket). */
  matchedQuestions: StrapiMatchingQuestion[];
  hoveredAnswerId: SharedValue<string>;
  onRegisterLayout: (answerId: string, layout: AnswerLayout) => void;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostVisible: SharedValue<boolean>;
  answerPositionsShared: SharedValue<AnswerPositionEntry[]>;
  wrongQuestionId: string | null;
  wrongQuestionThumbUrl: string | null;
  isDraggingWrongPiece: boolean;
  onWrongDragStart: (questionId: string, thumbUri: string | null) => void;
  onWrongDragEnd: (questionId: string, absoluteX: number, absoluteY: number) => void;
};

const MATCHED_THUMB = Math.round(CARD_SIZE * 0.38);

const MatchingAnswerCard = ({
  answer,
  isMatched,
  showMatchedCheck = true,
  showWrongCheck = true,
  emphasizeWrongCard = true,
  matchedQuestions,
  hoveredAnswerId,
  onRegisterLayout,
  ghostX,
  ghostY,
  ghostVisible,
  answerPositionsShared,
  wrongQuestionId,
  wrongQuestionThumbUrl,
  isDraggingWrongPiece,
  onWrongDragStart,
  onWrongDragEnd,
}: Props) => {
  const thumbUri = useOfflineAssetUri(answer.thumbnail?.url);
  const wrongThumbUri = useOfflineAssetUri(wrongQuestionThumbUrl);
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

  const wrongPan = useMemo(() => {
    if (!wrongQuestionId) {
      return Gesture.Pan().enabled(false);
    }
    const qid = wrongQuestionId;
    return Gesture.Pan()
      .minDistance(4)
      .onBegin((e) => {
        ghostX.value = e.absoluteX - CARD_SIZE / 2;
        ghostY.value = e.absoluteY - CARD_SIZE / 2;
        ghostVisible.value = true;
        runOnJS(onWrongDragStart)(qid, wrongThumbUri);
      })
      .onUpdate((e) => {
        ghostX.value = e.absoluteX - CARD_SIZE / 2;
        ghostY.value = e.absoluteY - CARD_SIZE / 2;

        const cx = e.absoluteX;
        const cy = e.absoluteY;
        const positions = answerPositionsShared.value;
        let found = '';
        for (let i = 0; i < positions.length; i++) {
          const p = positions[i];
          if (cx >= p.x && cx <= p.x + p.width && cy >= p.y && cy <= p.y + p.height) {
            found = p.id;
            break;
          }
        }
        hoveredAnswerId.value = found;
      })
      .onEnd((e) => {
        ghostVisible.value = false;
        hoveredAnswerId.value = '';
        runOnJS(onWrongDragEnd)(qid, e.absoluteX, e.absoluteY);
      })
      .onFinalize(() => {
        ghostVisible.value = false;
        hoveredAnswerId.value = '';
      });
  }, [
    wrongQuestionId,
    wrongThumbUri,
    ghostX,
    ghostY,
    ghostVisible,
    hoveredAnswerId,
    answerPositionsShared,
    onWrongDragStart,
    onWrongDragEnd,
  ]);

  // Runs entirely on the UI thread — smooth haze effect with no JS-bridge round-trip
  const hoverStyle = useAnimatedStyle(() => {
    const isHovered = !isMatched && hoveredAnswerId.value === answerId;
    return {
      backgroundColor: withTiming(
        isHovered ? colors.transparent : colors.background.primary,
        { duration: 120 },
      ),
      transform: [{ scale: withSpring(isHovered ? 1.06 : 1, { damping: 14, stiffness: 260 }) }],
    };
  });

  const wrongOverlayDimStyle = useAnimatedStyle(() => ({
    opacity: isDraggingWrongPiece ? 0.3 : 1,
  }));

  /** Show wrong piece whenever this answer has a wrong placement — even if the answer also has correct match(es). Otherwise the wrong question only shows an empty grid slot and looks "lost". */
  const showWrongOverlay = !!wrongQuestionId;
  /** Keep matched chips visible alongside the wrong overlay when both exist. */
  const showMatchedList = matchedQuestions.length > 0;
  const useMatchedSuccessStyle = isMatched && showMatchedCheck;

  return (
    <Animated.View
      ref={viewRef}
      onLayout={handleLayout}
      style={[
        styles.card,
        useMatchedSuccessStyle && styles.cardMatched,
        showWrongOverlay && emphasizeWrongCard && styles.cardWrong,
        hoverStyle,
      ]}
    >
      <View style={styles.answerMain}>
        {!showWrongOverlay ? (
          thumbUri ? (
            <Image source={{ uri: thumbUri }} style={styles.thumb} resizeMode="contain" />
          ) : (
            <View style={styles.thumbPlaceholder} />
          )
        ) : null}

        {showWrongOverlay ? (
          <GestureDetector gesture={wrongPan}>
            <Animated.View style={[styles.wrongOverlay, wrongOverlayDimStyle]}>
              {wrongThumbUri ? (
                <Image source={{ uri: wrongThumbUri }} style={styles.thumb} resizeMode="contain" />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
              {showWrongCheck ? (
                <View style={styles.badgeWrong}>
                  <IconButton
                    size="sm"
                    icon="close"
                    iconType="antd"
                    style={globalStyles.self_start}
                    iconFill={colors.danger.primary}
                    backgroundColor={colors.danger.tertiary}
                  />
                </View>
              ) : null}
            </Animated.View>
          </GestureDetector>
        ) : null}

        {isMatched && showMatchedCheck ? (
          <View style={styles.badge}>
            <IconButton
              size="sm"
              icon="check"
              style={globalStyles.self_start}
              iconFill={colors.success.primary}
              backgroundColor={colors.success.tertiary}
            />
          </View>
        ) : null}
      </View>

      {showMatchedList ? (
        <View style={styles.matchedList}>
          {matchedQuestions.map((mq) => (
            <MatchedQuestionChip key={mq.documentId} thumbUrl={mq.thumbnail?.url} />
          ))}
        </View>
      ) : null}

      <HazeOverlay hoveredAnswerId={hoveredAnswerId} answerId={answerId} isMatched={isMatched} />
    </Animated.View>
  );
};

const MatchedQuestionChip = ({ thumbUrl }: { thumbUrl?: string | null }) => {
  const uri = useOfflineAssetUri(thumbUrl);
  return (
    <View style={styles.matchedChip}>
      {uri ? (
        <Image source={{ uri }} style={styles.matchedThumb} resizeMode="contain" />
      ) : (
        <View style={styles.matchedThumbPlaceholder} />
      )}
    </View>
  );
};

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
    minHeight: CARD_SIZE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: themeToken.paddingSm,
  },
  answerMain: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    maxWidth: CARD_SIZE + 48,
    marginTop: 2,
  },
  matchedChip: {
    width: MATCHED_THUMB,
    height: MATCHED_THUMB,
    borderRadius: themeToken.borderRadius,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedThumb: {
    width: '88%',
    height: '88%',
  },
  matchedThumbPlaceholder: {
    width: '88%',
    height: '88%',
    backgroundColor: colors.background.tertiary,
    borderRadius: themeToken.borderRadius,
  },
  cardMatched: {
    borderColor: colors.success.primary,
    backgroundColor: colors.success.tertiary,
  },
  cardWrong: {
    borderWidth: 2,
    borderColor: colors.danger.primary,
    backgroundColor: colors.danger.tertiary,
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
  badgeWrong: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  wrongOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.primary,
  },
  hazeOverlay: {
    backgroundColor: colors.primary_light,
    borderRadius: themeToken.borderRadius,
  },
});
