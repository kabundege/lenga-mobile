import {
  useChapterByDocumentId,
  useChapterMatchings,
  useChapterQuizzes,
  useLessonForChapter,
  useMatchingQuestionsByMatchingId,
  useQAs,
} from "@/hooks/useLessons";
import { useAnalyticsTracking } from "@/hooks/useAnalytics";
import type { StrapiQA } from "@/types/api";
import { globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import {
  buildChapterSlides,
  unwrapStrapiRelationList,
} from "../utils/buildChapterSlides";

export const useChapterQuizScreen = () => {
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [allMatchedForCurrent, setAllMatchedForCurrent] = useState(false);
  const [ghostThumb, setGhostThumb] = useState<string | null>(null);

  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostVisible = useSharedValue(false);

  const handleDragStartGhost = useCallback((thumbUri: string | null) => {
    setGhostThumb(thumbUri);
  }, []);

  const handleDragEndGhost = useCallback(() => {
    setGhostThumb(null);
  }, []);

  const params = useLocalSearchParams<{
    chapterId: string;
    quizId?: string;
    matchingId?: string;
  }>();
  const chapterId =
    typeof params.chapterId === "string" ? params.chapterId : "";
  const quizId = typeof params.quizId === "string" ? params.quizId : "";
  const matchingId =
    typeof params.matchingId === "string" ? params.matchingId : "";
  const { lesson } = useLessonForChapter(chapterId);
  const {
    submitQuizResult,
    submitMatchingResult,
    recordChapterCompleted,
  } = useAnalyticsTracking();

  const {
    chapter,
    error: chapterError,
    refetch: chapterRefetch,
    isLoading: isChapterLoading,
    isRefetching: isChapterRefetching,
  } = useChapterByDocumentId(chapterId);
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

  const {
    qas: allQAs,
    refetch: qasRefetch,
    isLoading: isQAsLoading,
    isRefetching: isQAsRefetching,
  } = useQAs();

  const chapterSlides = useMemo(
    () => buildChapterSlides(chapterQuizzes, chapterMatchings),
    [chapterQuizzes, chapterMatchings],
  );

  const isLoading =
    isChapterLoading ||
    isChapterQuizzesLoading ||
    isChapterMatchingsLoading ||
    isQAsLoading;
  const isRefetching =
    isChapterRefetching ||
    isChapterQuizzesRefetching ||
    isChapterMatchingsRefetching ||
    isQAsRefetching;
  const error = chapterError ?? chapterQuizzesError ?? chapterMatchingsError;

  const refetch = useCallback(() => {
    chapterRefetch();
    chapterQuizzesRefetch();
    chapterMatchingsRefetch();
    qasRefetch();
  }, [
    chapterRefetch,
    chapterQuizzesRefetch,
    chapterMatchingsRefetch,
    qasRefetch,
  ]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={refetch}
        tintColor={colors.primary}
      />
    ),
    [isRefetching, refetch],
  );

  const activeSlide = chapterSlides[activeSlideIndex];
  const activeQuiz =
    activeSlide?.kind === "quiz" ? activeSlide.quiz : undefined;
  const activeMatching =
    activeSlide?.kind === "matching" ? activeSlide.matching : undefined;
  const { questions: matchingQuestions } = useMatchingQuestionsByMatchingId(
    activeMatching?.documentId ?? "",
  );
  const qas = useMemo((): StrapiQA[] => {
    if (!activeQuiz) return [];
    const fromQuiz = unwrapStrapiRelationList(
      activeQuiz.qas as StrapiQA[] | { data: StrapiQA[] } | undefined,
    );
    if (fromQuiz.length > 0) return fromQuiz;
    return allQAs.filter((qa) => qa.quiz?.documentId === activeQuiz.documentId);
  }, [activeQuiz, allQAs]);

  const quizContextDescription = activeQuiz?.description?.trim() ?? null;
  const hasQuizContext = Boolean(
    activeQuiz?.title_image?.url ||
    quizContextDescription ||
    activeQuiz?.title_image_audio?.url,
  );

  const qasScrollRef = useRef<ScrollView>(null);
  const matchingScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!quizId) return;
    const idx = chapterSlides.findIndex(
      (s) => s.kind === "quiz" && s.quiz.documentId === quizId,
    );
    if (idx >= 0 && idx !== activeSlideIndex) setActiveSlideIndex(idx);
  }, [quizId, chapterSlides, activeSlideIndex]);

  useEffect(() => {
    if (!matchingId) return;
    const idx = chapterSlides.findIndex(
      (s) => s.kind === "matching" && s.matching.documentId === matchingId,
    );
    if (idx >= 0 && idx !== activeSlideIndex) setActiveSlideIndex(idx);
  }, [matchingId, chapterSlides, activeSlideIndex]);

  useEffect(() => {
    setCorrectAnswerCount(0);
    setAllMatchedForCurrent(false);
    qasScrollRef.current?.scrollTo({ y: 0, animated: true });
    matchingScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeSlideIndex]);

  const pushSlideByIndex = useCallback(
    (nextIndex: number) => {
      if (!chapterSlides[nextIndex]) return;
      setActiveSlideIndex(nextIndex);
    },
    [chapterSlides],
  );

  const backButton = useMemo(() => {
    const isDisabled = activeSlideIndex <= 0;
    if (isDisabled)
      return {
        isDisabled,
        color: colors.text.tertiary,
        bgStyles: globalStyles.bg_tertiary,
      };
    return {
      isDisabled,
      color: colors.text.default,
      bgStyles: globalStyles.bg_primary_light,
    };
  }, [activeSlideIndex]);

  const isLastSlide = activeSlideIndex >= chapterSlides.length - 1;

  const totalCorrectQAs = useMemo(
    () => qas.filter((qa) => qa.is_correct_answer).length,
    [qas],
  );

  const canProceedCurrentSlide = useMemo(() => {
    if (!activeSlide) return false;
    if (activeSlide.kind === "quiz") {
      if (qas.length === 0 || totalCorrectQAs === 0) return true;
      const allOptionsAreCorrect = totalCorrectQAs === qas.length;
      return allOptionsAreCorrect
        ? correctAnswerCount >= 1
        : correctAnswerCount >= totalCorrectQAs;
    }
    return allMatchedForCurrent;
  }, [activeSlide, qas.length, totalCorrectQAs, correctAnswerCount, allMatchedForCurrent]);

  const nextButton = useMemo(() => {
    const isDisabled = !canProceedCurrentSlide;
    if (isDisabled)
      return {
        isDisabled,
        color: colors.text.tertiary,
        bgStyles: globalStyles.bg_tertiary,
      };
    return {
      isDisabled,
      color: colors.text.default,
      bgStyles: globalStyles.bg_primary_light,
    };
  }, [canProceedCurrentSlide]);

  const submitActiveSlideAssessment = useCallback(() => {
    if (!canProceedCurrentSlide || !activeSlide) return;

    if (activeSlide.kind === "quiz" && activeQuiz) {
      submitQuizResult({
        quizId: Number(activeQuiz.id),
        score: correctAnswerCount,
        totalQuestions: Math.max(qas.length, 1),
        isPassed: true,
      });
      return;
    }

    if (activeSlide.kind === "matching" && activeMatching) {
      const totalQuestions = Math.max(matchingQuestions.length, 1);
      submitMatchingResult({
        matchingId: Number(activeMatching.id),
        score: totalQuestions,
        totalQuestions,
        isPassed: allMatchedForCurrent,
      });
    }
  }, [
    activeMatching,
    activeQuiz,
    activeSlide,
    allMatchedForCurrent,
    canProceedCurrentSlide,
    correctAnswerCount,
    matchingQuestions.length,
    qas.length,
    submitMatchingResult,
    submitQuizResult,
  ]);

  const advanceFromCurrentSlide = useCallback(
    (isExitingChapter: boolean) => {
      submitActiveSlideAssessment();
      if (isExitingChapter && lesson && chapterId) {
        recordChapterCompleted(lesson, chapterId);
      }
    },
    [chapterId, lesson, recordChapterCompleted, submitActiveSlideAssessment],
  );

  const headerTitle =
    activeQuiz?.title ?? activeMatching?.title ?? chapter?.title ?? "Igice";
  const headerSubtitle =
    activeSlide && chapterSlides.length > 0
      ? activeSlide.kind === "quiz"
        ? `Umwitozo wa ${activeSlideIndex + 1}`
        : `Umwitozo wo guhuza wa ${activeSlideIndex + 1}`
      : undefined;
  const headerAudioUrl =
    activeQuiz?.audio_desc?.url ??
    activeMatching?.audio_desc?.url ??
    chapter?.audio_desc?.url;

  return {
    chapterId,
    error,
    isLoading,
    refetch,
    refreshControl,
    chapter,
    lesson,
    chapterSlides,
    activeSlideIndex,
    activeSlide,
    activeQuiz,
    activeMatching,
    qas,
    hasQuizContext,
    quizContextDescription,
    qasScrollRef,
    matchingScrollRef,
    ghostX,
    ghostY,
    ghostVisible,
    ghostThumb,
    handleDragStartGhost,
    handleDragEndGhost,
    pushSlideByIndex,
    backButton,
    nextButton,
    isLastSlide,
    headerTitle,
    headerSubtitle,
    headerAudioUrl,
    quizAnswered: activeSlide?.kind === "quiz" && canProceedCurrentSlide,
    incrementCorrectAnswerCount: () => setCorrectAnswerCount((n) => n + 1),
    setAllMatchedForCurrent,
    canProceedCurrentSlide,
    advanceFromCurrentSlide,
  };
};
