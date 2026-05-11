import { TextBody } from "@/components/typography";
import { ThemedView } from "@/components/themed-view";
import ContentThumbnailHeader from "@/components/headers/ContentThumbnailHeader";
import { router } from "expo-router";
import { globalStyles } from "@/utils/styles";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chapterQuizScreenStyles as styles } from "./chapterQuizScreen.styles";
import { ChapterQuizBottomNav } from "./components/ChapterQuizBottomNav";
import { ChapterQuizSlideArea } from "./components/ChapterQuizSlideArea";
import { useChapterQuizScreen } from "./hooks/useChapterQuizScreen";

const ChapterQuizScreen = () => {
  const insets = useSafeAreaInsets();
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
    headerSubtitle,
    headerAudioUrl,
    showMainNav,
    setHasQuizRightAnswer,
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

  return (
    <ThemedView style={styles.container}>
      <ContentThumbnailHeader
        onBack={router.back}
        title={headerTitle}
        subtitle={headerSubtitle}
        thumbnailUrl={chapter?.thumbnail?.url}
        audioUrl={headerAudioUrl}
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
        onQuizRightAnswer={() => setHasQuizRightAnswer(true)}
        onMatchingAllMatched={() => setAllMatchedForCurrent(true)}
      />

      <ChapterQuizBottomNav
        insets={insets}
        showMainNav={showMainNav}
        isLastSlide={isLastSlide}
        backButton={backButton}
        nextButton={nextButton}
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
