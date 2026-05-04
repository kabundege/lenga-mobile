import colors from '@/utils/theme/colors';
import Button from '@/components/buttons/button';
import { themeToken } from '@/utils/theme/styles';
import { TextBody } from '@/components/typography';
import { ThemedView } from '@/components/themed-view';
import QuizQACard from '@/components/cards/QuizQACard';
import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useChapterByDocumentId, useChapterMatchings, useChapterQuizzes } from '@/hooks/useLessons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import type { StrapiMatching, StrapiQuiz } from '@/types/api';
import { MatchingGameBoard } from './matching/MatchingGameBoard';
import { MatchingGhostCard } from './matching/MatchingGhostCard';
import { chapterMatchingStyles as matchingStyles } from './matching/chapterMatchingStyles';
import { useSharedValue } from 'react-native-reanimated';

type ChapterSlide = { kind: 'quiz'; quiz: StrapiQuiz } | { kind: 'matching'; matching: StrapiMatching };

const buildChapterSlides = (chapterQuizzes: StrapiQuiz[], chapterMatchings: StrapiMatching[]): ChapterSlide[] => {
  const sortedQuizzes = chapterQuizzes.slice().sort((a, b) => a.order - b.order);
  const entries: { order: number; slide: ChapterSlide }[] = [
    ...sortedQuizzes.map((quiz) => ({ order: quiz.order, slide: { kind: 'quiz' as const, quiz } })),
    ...chapterMatchings.map((matching) => ({
      order: matching.order,
      slide: { kind: 'matching' as const, matching },
    })),
  ];
  entries.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    if (a.slide.kind !== b.slide.kind) return a.slide.kind === 'quiz' ? -1 : 1;
    const idA = a.slide.kind === 'quiz' ? a.slide.quiz.documentId : a.slide.matching.documentId;
    const idB = b.slide.kind === 'quiz' ? b.slide.quiz.documentId : b.slide.matching.documentId;
    return idA.localeCompare(idB);
  });
  return entries.map((e) => e.slide);
};

const ChapterQuizScreen = () => {
  const [hasQuizRightAnswer, setHasQuizRightAnswer] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [allMatchedForCurrent, setAllMatchedForCurrent] = useState(false);
  const [ghostThumb, setGhostThumb] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostVisible = useSharedValue(false);

  const handleDragStartGhost = useCallback((thumbUri: string | null) => {
    setGhostThumb(thumbUri);
  }, []);

  const handleDragEndGhost = useCallback(() => {
    setGhostThumb(null);
  }, []);

  const params = useLocalSearchParams<{ chapterId: string; quizId?: string; matchingId?: string }>();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : '';
  const quizId = typeof params.quizId === 'string' ? params.quizId : '';
  const matchingId = typeof params.matchingId === 'string' ? params.matchingId : '';

  const { chapter, isLoading: isChapterLoading, isRefetching: isChapterRefetching, error: chapterError, refetch: chapterRefetch } =
    useChapterByDocumentId(chapterId);
  const {
    chapterQuizzes,
    error: chapterQuizzesError,
    refetch: chapterQuizzesRefetch,
    isLoading: isChapterQuizzesLoading,
    isRefetching: isChapterQuizzesRefetching,
  } = useChapterQuizzes(chapterId);

  const {
    chapterMatchings,
    error: chapterMatchingsError,
    refetch: chapterMatchingsRefetch,
    isLoading: isChapterMatchingsLoading,
    isRefetching: isChapterMatchingsRefetching,
  } = useChapterMatchings(chapterId);

  const chapterSlides = useMemo(
    () => buildChapterSlides(chapterQuizzes, chapterMatchings),
    [chapterQuizzes, chapterMatchings],
  );

  const isLoading = isChapterLoading || isChapterQuizzesLoading || isChapterMatchingsLoading;
  const isRefetching =
    isChapterRefetching || isChapterQuizzesRefetching || isChapterMatchingsRefetching;
  const error = chapterError ?? chapterQuizzesError ?? chapterMatchingsError;

  const refetch = useCallback(() => {
    chapterRefetch();
    chapterQuizzesRefetch();
    chapterMatchingsRefetch();
  }, [chapterRefetch, chapterQuizzesRefetch, chapterMatchingsRefetch]);

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />,
    [isRefetching, refetch],
  );

  const activeSlide = chapterSlides[activeSlideIndex];
  const activeQuiz = activeSlide?.kind === 'quiz' ? activeSlide.quiz : undefined;
  const activeMatching = activeSlide?.kind === 'matching' ? activeSlide.matching : undefined;
  const qas = useMemo(() => activeQuiz?.qas ?? [], [activeQuiz]);

  const qasScrollRef = useRef<ScrollView>(null);
  const matchingScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!quizId) return;
    const idx = chapterSlides.findIndex((s) => s.kind === 'quiz' && s.quiz.documentId === quizId);
    if (idx >= 0 && idx !== activeSlideIndex) setActiveSlideIndex(idx);
  }, [quizId, chapterSlides, activeSlideIndex]);

  useEffect(() => {
    if (!matchingId) return;
    const idx = chapterSlides.findIndex((s) => s.kind === 'matching' && s.matching.documentId === matchingId);
    if (idx >= 0 && idx !== activeSlideIndex) setActiveSlideIndex(idx);
  }, [matchingId, chapterSlides, activeSlideIndex]);

  useEffect(() => {
    setHasQuizRightAnswer(false);
    setAllMatchedForCurrent(false);
    qasScrollRef.current?.scrollTo({ y: 0, animated: true });
    matchingScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeSlideIndex]);

  const pushSlideByIndex = useCallback((nextIndex: number) => {
    if (!chapterSlides[nextIndex]) return;
    setActiveSlideIndex(nextIndex);
  }, [chapterSlides]);

  const backButton = useMemo(() => {
    const isDisabled = activeSlideIndex <= 0;
    if (isDisabled) return { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary };
    return { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [activeSlideIndex]);

  const isLastSlide = activeSlideIndex >= chapterSlides.length - 1;

  const canProceedCurrentSlide = useMemo(() => {
    if (!activeSlide) return false;
    if (activeSlide.kind === 'quiz') {
      const qCount = activeSlide.quiz.qas?.length ?? 0;
      return qCount === 0 || hasQuizRightAnswer;
    }
    return allMatchedForCurrent;
  }, [activeSlide, hasQuizRightAnswer, allMatchedForCurrent]);

  const nextButton = useMemo(() => {
    const isDisabled = !canProceedCurrentSlide;
    if (isDisabled) return { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary };
    return { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [canProceedCurrentSlide]);

  const RenderQas = useCallback(() => {
    return qas.map((qa) => (
      <QuizQACard key={qa.documentId} qaId={qa.documentId} rightAnswerCallBack={() => setHasQuizRightAnswer(true)} />
    ));
  }, [qas]);

  const headerTitle = activeQuiz?.title ?? activeMatching?.title ?? chapter?.title ?? 'Igice';
  const headerSubtitle =
    activeSlide && chapterSlides.length > 0
      ? activeSlide.kind === 'quiz'
        ? `Umwitozo wa ${activeSlideIndex + 1}`
        : `Guhuzanya kwa ${activeSlideIndex + 1}`
      : undefined;
  const headerAudioUrl = activeQuiz?.audio_desc?.url ?? activeMatching?.audio_desc?.url ?? chapter?.audio_desc?.url;

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

  /** Multi-slide flow, or a single matching (matching screen always showed chapter nav). */
  const showMainNav =
    chapterSlides.length > 1 || (chapterSlides.length === 1 && activeSlide?.kind === 'matching');

  return (
    <ThemedView style={styles.container}>
      <ContentThumbnailHeader
        onBack={router.back}
        title={headerTitle}
        subtitle={headerSubtitle}
        thumbnailUrl={chapter?.thumbnail?.url}
        audioUrl={headerAudioUrl}
      />

      {activeSlide?.kind === 'quiz' && qas.length > 0 ? (
        <ScrollView style={globalStyles.flex_1} contentContainerStyle={styles.grid} ref={qasScrollRef} refreshControl={refreshControl}>
          <RenderQas />
        </ScrollView>
      ) : activeSlide?.kind === 'matching' && activeMatching ? (
        <ScrollView
          ref={matchingScrollRef}
          style={globalStyles.flex_1}
          contentContainerStyle={matchingStyles.content}
          refreshControl={refreshControl}
        >
          <MatchingGameBoard
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
      ) : !isLoading && chapterSlides.length === 0 ? (
        <EmptyListWithSkeleton
          title="Nta myitozo iboneka"
          description="Nta myitozo iboneka muri iki gice."
          containerStyles={styles.emptyState}
        />
      ) : !isLoading && activeSlide?.kind === 'quiz' && qas.length === 0 ? (
        <EmptyListWithSkeleton
          title="Nta bibazo biboneka"
          description="Nta bibazo biboneka muri uyu mwitozo."
          containerStyles={styles.emptyState}
        />
      ) : null}

      {activeSlide?.kind === 'matching' ? (
        <MatchingGhostCard ghostX={ghostX} ghostY={ghostY} ghostVisible={ghostVisible} thumbUri={ghostThumb} />
      ) : null}

      {showMainNav ? (
        <View style={[flexBetween, globalStyles.px_md, { paddingBottom: insets.bottom + themeToken.paddingSm }]}>
          <Button
            size="sm"
            type="primary"
            label="Ibibanza"
            textStyles={globalStyles.w_auto}
            textColor={backButton.color}
            disabled={backButton.isDisabled}
            onPress={() => pushSlideByIndex(Math.max(0, activeSlideIndex - 1))}
            leftIcon={{ name: 'chevron-left', color: backButton.color }}
            overRiddingStyles={[globalStyles.w_40, backButton.bgStyles]}
          />
          <Button
            size="sm"
            type="primary"
            label={isLastSlide ? 'Sohoka' : 'Ibikurikira'}
            textColor={nextButton.color}
            textStyles={globalStyles.w_auto}
            disabled={nextButton.isDisabled}
            overRiddingStyles={[globalStyles.w_40, nextButton.bgStyles]}
            rightIcon={{ name: 'chevron-right', color: nextButton.color }}
            onPress={() => {
              if (isLastSlide) {
                router.back();
                return;
              }
              pushSlideByIndex(Math.min(chapterSlides.length - 1, activeSlideIndex + 1));
            }}
          />
        </View>
      ) : null}
    </ThemedView>
  );
};

export default ChapterQuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  grid: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    ...globalStyles.py_md,
    justifyContent: 'center',
    rowGap: Dimensions.SIZE_XL,
  },
  quizCard: {
    borderWidth: 1,
    padding: themeToken.padding,
    marginTop: themeToken.spacingSm,
    borderColor: colors.border.primary,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.secondary,
  },
  emptyState: {
    paddingVertical: themeToken.paddingLg,
    alignItems: 'center',
  },
  videoCtaCard: {
    padding: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
});
