import ContentThumbnailHeader from "@/components/headers/ContentThumbnailHeader";
import { ThemedView } from "@/components/themed-view";
import { TextBody } from "@/components/typography";
import { globalStyles } from "@/utils/styles";
import { router } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chapterQuizScreenStyles as styles } from "./chapterQuizScreen.styles";
import { ChapterQuizBottomNav } from "./components/ChapterQuizBottomNav";
import { ChapterQuizSlideArea } from "./components/ChapterQuizSlideArea";
import { useChapterQuizScreen } from "./hooks/useChapterQuizScreen";

const ChapterQuizScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    chapterId,
    error,
    isLoading,
    refetch,
    refreshControl,
    chapter,
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
    lesson,
    headerSubtitle,
    headerAudioUrl,
    quizAnswered,
    incrementCorrectAnswerCount,
    setAllMatchedForCurrent,
  } = useChapterQuizScreen();

  if (!chapterId)
    return <ThemedView style={[styles.container, globalStyles.center]} />;

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

  const breadcrumbItems = useMemo(() => {
    return [
      lesson?.order
        ? `${t("lessons.lesson")} ${lesson.order}`
        : t("lessons.lessonTitleFallback"),
      chapter?.order
        ? `${t("lessons.chapter")} ${chapter.order}`
        : t("lessons.chapterTitleFallback"),
    ];
  }, [lesson?.order, chapter?.order, t]);

  return (
    <ThemedView style={styles.container}>
      <ContentThumbnailHeader
        onBack={router.back}
        title={headerTitle}
        subtitle={headerSubtitle}
        audioUrl={headerAudioUrl}
        breadcrumbItems={breadcrumbItems}
        thumbnailUrl={chapter?.thumbnail?.url}
      />

      <ChapterQuizSlideArea
        refreshControl={refreshControl}
        isLoading={isLoading}
        chapterSlides={chapterSlides}
        activeSlide={activeSlide}
        activeQuiz={activeQuiz}
        activeMatching={activeMatching}
        qas={qas}
        hasQuizContext={hasQuizContext}
        quizContextDescription={quizContextDescription}
        qasScrollRef={qasScrollRef}
        matchingScrollRef={matchingScrollRef}
        ghostX={ghostX}
        ghostY={ghostY}
        ghostVisible={ghostVisible}
        ghostThumb={ghostThumb}
        handleDragStartGhost={handleDragStartGhost}
        handleDragEndGhost={handleDragEndGhost}
        quizAnswered={quizAnswered}
        onQuizRightAnswer={incrementCorrectAnswerCount}
        onMatchingAllMatched={() => setAllMatchedForCurrent(true)}
      />

      <ChapterQuizBottomNav
        insets={insets}
        backButton={backButton}
        nextButton={nextButton}
        isLastSlide={isLastSlide}
        onBack={() => pushSlideByIndex(Math.max(0, activeSlideIndex - 1))}
        onNext={() => {
          if (isLastSlide) {
            router.back();
            return;
          }
          pushSlideByIndex(
            Math.min(chapterSlides.length - 1, activeSlideIndex + 1),
          );
        }}
      />
    </ThemedView>
  );
};

export default ChapterQuizScreen;
