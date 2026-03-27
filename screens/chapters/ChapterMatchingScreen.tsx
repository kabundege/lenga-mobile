import colors from '@/utils/theme/colors';
import Button from '@/components/buttons/button';
import { API_URL } from '@/utils/functions/env';
import { themeToken } from '@/utils/theme/styles';
import { TextBody } from '@/components/typography';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { flexBetween, globalStyles } from '@/utils/styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';
import { Pressable, ScrollView, StyleSheet, View, Image } from 'react-native';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useChapterByDocumentId,
  useChapterMatchings,
  useMatchingAnswersByMatchingId,
  useMatchingQuestionsByMatchingId,
} from '@/hooks/useLessons';
import { useLessonAudio } from '@/hooks/useLessonAudio';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import MatchingQuestionCard, { CARD_SIZE, type AnswerLayout, type AnswerPositionEntry } from '@/components/cards/MatchingQuestionCard';
import MatchingAnswerCard from '@/components/cards/MatchingAnswerCard';
import type { StrapiMatchingAnswer } from '@/types/api';

const correctAnswerAudio = API_URL + '/uploads/correct_7f6e03656f.mp3';

// ─── Ghost overlay (follows the finger) ─────────────────────────────────────

type GhostCardProps = {
  thumbUri: string | null;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostVisible: SharedValue<boolean>;
};

const GhostCard = ({ thumbUri, ghostX, ghostY, ghostVisible }: GhostCardProps) => {
  const style = useAnimatedStyle(() => ({
    opacity: ghostVisible.value ? 0.9 : 0,
    transform: [{ translateX: ghostX.value }, { translateY: ghostY.value }],
    pointerEvents: 'none',
  }));

  const imgUri = useOfflineAssetUri(thumbUri);

  return (
    <Animated.View style={[styles.ghost, style]}>
      {imgUri ? <Image source={{ uri: imgUri }} style={styles.ghostThumb} resizeMode="contain" /> : null}
    </Animated.View>
  );
};

// ─── Per-matching game board ─────────────────────────────────────────────────

type GameBoardProps = {
  matchingId: string;
  onAllMatched: () => void;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostVisible: SharedValue<boolean>;
  onDragStartGhost: (thumbUri: string | null) => void;
  onDragEndGhost: () => void;
};

const GameBoard = ({
  matchingId,
  onAllMatched,
  ghostX,
  ghostY,
  ghostVisible,
  onDragStartGhost,
  onDragEndGhost,
}: GameBoardProps) => {
  const { questions } = useMatchingQuestionsByMatchingId(matchingId);
  const { answers } = useMatchingAnswersByMatchingId(matchingId);

  // Map: questionDocumentId -> answerId (confirmed correct pairs only)
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [draggingQuestion, setDraggingQuestion] = useState<string | null>(null);

  const answerLayouts = useRef<Record<string, AnswerLayout>>({});

  // Shared values so hover hit-testing runs entirely on the UI thread
  const answerPositionsShared = useSharedValue<AnswerPositionEntry[]>([]);
  const hoveredAnswerId = useSharedValue('');

  const { audioLoaded: correctAudioLoaded, toggleAudio: playCorrectAudio } =
    useLessonAudio(correctAnswerAudio);

  // Shuffle answers once when the matching data loads
  const shuffledAnswers = useMemo<StrapiMatchingAnswer[]>(() => {
    if (!answers.length) return [];
    return [...answers].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.map((a) => a.documentId).join(',')]);

  const matchedCount = Object.keys(matchedPairs).length;
  const totalCount = questions.length;

  useEffect(() => {
    if (totalCount > 0 && matchedCount >= totalCount) {
      const t = setTimeout(onAllMatched, 600);
      return () => clearTimeout(t);
    }
  }, [matchedCount, totalCount, onAllMatched]);

  const registerAnswerLayout = useCallback((answerId: string, layout: AnswerLayout) => {
    answerLayouts.current[answerId] = layout;
    // Rebuild the shared-value array so onUpdate worklets can hit-test on the UI thread
    answerPositionsShared.value = Object.entries(answerLayouts.current).map(
      ([id, pos]) => ({ id, ...pos }),
    );
  }, [answerPositionsShared]);

  const handleDragStart = useCallback((questionId: string, thumbUri: string | null) => {
    setDraggingQuestion(questionId);
    onDragStartGhost(thumbUri);
  }, [onDragStartGhost]);

  const handleDragEnd = useCallback(
    (questionId: string, absoluteX: number, absoluteY: number) => {
      setDraggingQuestion(null);
      onDragEndGhost();

      for (const [answerId, layout] of Object.entries(answerLayouts.current)) {
        const hit =
          absoluteX >= layout.x &&
          absoluteX <= layout.x + layout.width &&
          absoluteY >= layout.y &&
          absoluteY <= layout.y + layout.height;

        if (!hit) continue;

        const question = questions.find((q) => q.documentId === questionId);
        const isCorrect = question?.matching_answer?.documentId === answerId;

        if (isCorrect) {
          setMatchedPairs((prev) => ({ ...prev, [questionId]: answerId }));
          if (correctAudioLoaded) {
            playCorrectAudio();
          }
        }
        return;
      }
    },
    [questions, correctAudioLoaded, playCorrectAudio, onDragEndGhost]
  );

  const matchedAnswerIds = useMemo(() => new Set(Object.values(matchedPairs)), [matchedPairs]);

  return (
    <View style={styles.columns}>
      {/* Questions column */}
      <View style={styles.column}>
          {questions.map((q) => (
            <MatchingQuestionCard
              key={q.documentId}
              question={q}
              isMatched={!!matchedPairs[q.documentId]}
              isDraggingThis={draggingQuestion === q.documentId}
              ghostX={ghostX}
              ghostY={ghostY}
              ghostVisible={ghostVisible}
              hoveredAnswerId={hoveredAnswerId}
              answerPositionsShared={answerPositionsShared}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Answers column */}
      <View style={styles.column}>
          {shuffledAnswers.map((a) => (
            <MatchingAnswerCard
              key={a.documentId}
              answer={a}
              isMatched={matchedAnswerIds.has(a.documentId)}
              hoveredAnswerId={hoveredAnswerId}
              onRegisterLayout={registerAnswerLayout}
            />
          ))}
      </View>
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const ChapterMatchingScreen = () => {
  const [activeMatchingIndex, setActiveMatchingIndex] = useState(0);
  const [allMatchedForCurrent, setAllMatchedForCurrent] = useState(false);
  const [ghostThumb, setGhostThumb] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Ghost shared values live here so the GhostCard renders outside the ScrollView
  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostVisible = useSharedValue(false);

  const handleDragStartGhost = useCallback((thumbUri: string | null) => {
    setGhostThumb(thumbUri);
  }, []);

  const handleDragEndGhost = useCallback(() => {
    setGhostThumb(null);
  }, []);

  const params = useLocalSearchParams<{ chapterId: string; lessonId?: string; matchingId?: string }>();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : '';
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';
  const matchingId = typeof params.matchingId === 'string' ? params.matchingId : '';

  const { chapter, isLoading: isChapterLoading, error: chapterError, refetch: chapterRefetch } =
    useChapterByDocumentId(chapterId);

  const {
    chapterMatchings,
    isLoading: isMatchingsLoading,
    error: matchingsError,
    refetch: matchingsRefetch,
  } = useChapterMatchings(chapterId);

  const isLoading = isChapterLoading || isMatchingsLoading;
  const error = chapterError ?? matchingsError;

  const refetch = useCallback(() => {
    chapterRefetch();
    matchingsRefetch();
  }, [chapterRefetch, matchingsRefetch]);

  const activeMatching = useMemo(
    () => chapterMatchings[activeMatchingIndex],
    [chapterMatchings, activeMatchingIndex]
  );

  // Sync matchingId param → index
  useEffect(() => {
    if (!matchingId) return;
    const idx = chapterMatchings.findIndex((m) => m.documentId === matchingId);
    if (idx >= 0 && idx !== activeMatchingIndex) setActiveMatchingIndex(idx);
  }, [matchingId, chapterMatchings, activeMatchingIndex]);

  // Reset per-matching state when index changes
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    setAllMatchedForCurrent(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeMatchingIndex]);

  const pushMatchingByIndex = useCallback(
    (nextIndex: number) => {
      const next = chapterMatchings[nextIndex];
      if (!next) return;
      setAllMatchedForCurrent(false);
      setActiveMatchingIndex(nextIndex);
    },
    [chapterMatchings]
  );

  const isLastMatching = activeMatchingIndex >= chapterMatchings.length - 1;

  const backButton = useMemo(() => {
    const isDisabled = activeMatchingIndex <= 0;
    return isDisabled
      ? { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary }
      : { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [activeMatchingIndex]);

  const nextButton = useMemo(() => {
    const isDisabled = !allMatchedForCurrent;
    return isDisabled
      ? { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary }
      : { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [allMatchedForCurrent]);

  if (!chapterId) return <ThemedView style={[styles.container, globalStyles.center]} />;

  if (error) {
    return (
      <ThemedView style={[styles.container, globalStyles.center]}>
        <TextBody variant="body2" strong>
          Ntibyashobotse gufungura igice.
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
        title={activeMatching?.title ?? chapter?.title ?? 'Guhuzanya'}
        subtitle={activeMatching ? `Guhuzanya kwa ${activeMatchingIndex + 1}` : undefined}
        thumbnailUrl={chapter?.thumbnail?.url}
        audioUrl={activeMatching?.audio_desc?.url ?? chapter?.audio_desc?.url}
      />

      {activeMatching ? (
        <ScrollView
          ref={scrollRef}
          style={globalStyles.flex_1}
          contentContainerStyle={styles.content}
        >
          <GameBoard
            key={activeMatching.documentId}
            matchingId={activeMatching.documentId}
            onAllMatched={() => setAllMatchedForCurrent(true)}
            ghostX={ghostX}
            ghostY={ghostY}
            ghostVisible={ghostVisible}
            onDragStartGhost={handleDragStartGhost}
            onDragEndGhost={handleDragEndGhost}
          />
        </ScrollView>
      ) : !isLoading ? (
        <EmptyListWithSkeleton
          title="Nta guhuzanya biboneka"
          description="Nta guhuzanya biboneka muri iki gice."
          containerStyles={styles.emptyState}
        />
      ) : null}

      {/* Ghost card rendered outside ScrollView so absolute coords map to screen correctly */}
      <GhostCard
        thumbUri={ghostThumb}
        ghostX={ghostX}
        ghostY={ghostY}
        ghostVisible={ghostVisible}
      />

      {chapterMatchings.length > 1 || chapterMatchings.length === 1 ? (
        <View style={[flexBetween, globalStyles.px_md, { paddingBottom: insets.bottom + themeToken.paddingSm }]}>
          <Button
            size="sm"
            type="primary"
            label="Ibibanza"
            textStyles={globalStyles.w_auto}
            textColor={backButton.color}
            disabled={backButton.isDisabled}
            onPress={() => pushMatchingByIndex(Math.max(0, activeMatchingIndex - 1))}
            leftIcon={{ name: 'chevron-left', color: backButton.color }}
            overRiddingStyles={[globalStyles.w_40, backButton.bgStyles]}
          />
          <Button
            size="sm"
            type="primary"
            label={isLastMatching ? 'Sohoka' : 'Ibikurikira'}
            textColor={nextButton.color}
            textStyles={globalStyles.w_auto}
            disabled={nextButton.isDisabled}
            overRiddingStyles={[globalStyles.w_40, nextButton.bgStyles]}
            rightIcon={{ name: 'chevron-right', color: nextButton.color }}
            onPress={() => {
              if (isLastMatching) {
                router.back();
                return;
              }
              pushMatchingByIndex(Math.min(chapterMatchings.length - 1, activeMatchingIndex + 1));
            }}
          />
        </View>
      ) : null}
    </ThemedView>
  );
};

export default ChapterMatchingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingVertical: themeToken.paddingLg,
    paddingHorizontal: themeToken.padding,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: themeToken.paddingLg,
    alignItems: 'center',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: themeToken.paddingLg,
  },
  column: {
    gap: themeToken.spacing,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border.primary,
    marginHorizontal: themeToken.paddingSm,
  },
  ghost: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ghostThumb: {
    width: '90%',
    height: '90%',
  },
});
