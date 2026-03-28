import { type StrapiMatchingQuestion } from '@/types/api';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { Dimensions, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { Image, StyleSheet, View } from 'react-native';
import IconButton from '../buttons/iconButton';

export type AnswerLayout = { x: number; y: number; width: number; height: number };
export type AnswerPositionEntry = AnswerLayout & { id: string };

type Props = {
  question: StrapiMatchingQuestion;
  isMatched: boolean;
  /** When true, the question thumbnail sits on a wrong answer; drag from that answer instead. */
  isPlacedWrong: boolean;
  isDraggingThis: boolean;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostVisible: SharedValue<boolean>;
  hoveredAnswerId: SharedValue<string>;
  answerPositionsShared: SharedValue<AnswerPositionEntry[]>;
  onDragStart: (questionId: string, thumbUri: string | null) => void;
  onDragEnd: (questionId: string, absoluteX: number, absoluteY: number) => void;
};

const CARD_SIZE = Dimensions.SCREEN_WIDTH * 0.3;

const MatchingQuestionCard = ({
  question,
  isMatched,
  isPlacedWrong,
  isDraggingThis,
  ghostX,
  ghostY,
  ghostVisible,
  hoveredAnswerId,
  answerPositionsShared,
  onDragStart,
  onDragEnd,
}: Props) => {
  const thumbUri = useOfflineAssetUri(question.thumbnail?.url);
  const questionId = question.documentId;

  const pan = Gesture.Pan()
    .enabled(!isMatched && !isPlacedWrong)
    .minDistance(4)
    .onBegin((e) => {
      ghostX.value = e.absoluteX - CARD_SIZE / 2;
      ghostY.value = e.absoluteY - CARD_SIZE / 2;
      ghostVisible.value = true;
      runOnJS(onDragStart)(questionId, thumbUri);
    })
    .onUpdate((e) => {
      ghostX.value = e.absoluteX - CARD_SIZE / 2;
      ghostY.value = e.absoluteY - CARD_SIZE / 2;

      // Hit-test on the UI thread — no JS bridge involved
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
      runOnJS(onDragEnd)(questionId, e.absoluteX, e.absoluteY);
    })
    .onFinalize(() => {
      ghostVisible.value = false;
      hoveredAnswerId.value = '';
    });

  const dimmedStyle = useAnimatedStyle(() => ({
    opacity: isDraggingThis ? 0.3 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, dimmedStyle]}>
        {thumbUri && !isPlacedWrong ? (
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
      </Animated.View>
    </GestureDetector>
  );
};

export default MatchingQuestionCard;

export { CARD_SIZE };

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
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
});
