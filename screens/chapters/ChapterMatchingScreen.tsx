import Button from "@/components/buttons/button";
import { EmptyListWithSkeleton } from "@/components/empty-states";
import ContentThumbnailHeader from "@/components/headers/ContentThumbnailHeader";
import { ThemedView } from "@/components/themed-view";
import { TextBody } from "@/components/typography";
import { useLessonForChapter, useMatchingQuestionsByMatchingId } from "@/hooks/useLessons";
import { useAnalyticsTracking } from "@/hooks/useAnalytics";
import { flexBetween, globalStyles } from "@/utils/styles";
import { themeToken } from "@/utils/theme/styles";
import { router } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chapterMatchingStyles as styles } from "./matching/chapterMatchingStyles";
import { MatchingGameBoard } from "./matching/MatchingGameBoard";
import { MatchingGhostCard } from "./matching/MatchingGhostCard";
import { useChapterMatchingScreen } from "./matching/useChapterMatchingScreen";

const ChapterMatchingScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    chapterId,
    chapter,
    chapterMatchings,
    isLoading,
    error,
    refetch,
    activeMatching,
    activeMatchingIndex,
    allMatchedForCurrent,
    setAllMatchedForCurrent,
    scrollRef,
    pushMatchingByIndex,
    isLastMatching,
    backButton,
    nextButton,
    ghostThumb,
    ghostX,
    ghostY,
    ghostVisible,
    handleDragStartGhost,
    handleDragEndGhost,
  } = useChapterMatchingScreen();

  const { lesson } = useLessonForChapter(chapterId);
  const { questions } = useMatchingQuestionsByMatchingId(
    activeMatching?.documentId ?? "",
  );
  const { submitMatchingResult, recordChapterCompleted } = useAnalyticsTracking();

  const handleMatchingAdvance = (exiting: boolean) => {
    if (!activeMatching || !allMatchedForCurrent) return;

    const totalQuestions = Math.max(questions.length, 1);
    submitMatchingResult({
      matchingId: Number(activeMatching.id),
      score: totalQuestions,
      totalQuestions,
      isPassed: true,
    });

    if (exiting && lesson && chapterId) {
      recordChapterCompleted(lesson, chapterId);
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      lesson?.title ?? t("lessons.lessonTitleFallback"),
      chapter?.title ?? t("lessons.chapterTitleFallback"),
      t("lessons.breadcrumb.matching"),
    ],
    [lesson?.title, chapter?.title, t],
  );

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
        breadcrumbItems={breadcrumbItems}
        thumbnailUrl={chapter?.thumbnail?.url}
        title={activeMatching?.title ?? chapter?.title ?? "Guhuzanya"}
        audioUrl={activeMatching?.audio_desc?.url ?? chapter?.audio_desc?.url}
        subtitle={
          activeMatching
            ? `Umwitozo wo guhuza wa ${activeMatchingIndex + 1}`
            : undefined
        }
      />

      {activeMatching ? (
        <ScrollView
          ref={scrollRef}
          style={globalStyles.flex_1}
          contentContainerStyle={styles.content}
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
      ) : !isLoading ? (
        <EmptyListWithSkeleton
          title="Nta mwitozo wo guhuza waboneka"
          description="Nta mwitozo wo guhuza wboneka muri iki gice."
          containerStyles={styles.emptyState}
        />
      ) : null}

      <MatchingGhostCard
        thumbUri={ghostThumb}
        ghostX={ghostX}
        ghostY={ghostY}
        ghostVisible={ghostVisible}
      />

      {chapterMatchings.length > 0 ? (
        <View
          style={[
            flexBetween,
            globalStyles.px_md,
            { paddingBottom: insets.bottom + themeToken.paddingSm },
          ]}
        >
          <Button
            size="sm"
            type="primary"
            label="Ibibanza"
            textStyles={globalStyles.w_auto}
            textColor={backButton.color}
            disabled={backButton.isDisabled}
            onPress={() =>
              pushMatchingByIndex(Math.max(0, activeMatchingIndex - 1))
            }
            leftIcon={{ name: "chevron-left", color: backButton.color }}
            overRiddingStyles={[globalStyles.w_40, backButton.bgStyles]}
          />
          <Button
            size="sm"
            type="primary"
            label={isLastMatching ? "Sohoka" : "Ibikurikira"}
            textColor={nextButton.color}
            textStyles={globalStyles.w_auto}
            disabled={nextButton.isDisabled}
            overRiddingStyles={[globalStyles.w_40, nextButton.bgStyles]}
            rightIcon={{ name: "chevron-right", color: nextButton.color }}
            onPress={() => {
              if (isLastMatching) {
                handleMatchingAdvance(true);
                router.back();
                return;
              }
              handleMatchingAdvance(false);
              pushMatchingByIndex(
                Math.min(chapterMatchings.length - 1, activeMatchingIndex + 1),
              );
            }}
          />
        </View>
      ) : null}
    </ThemedView>
  );
};

export default ChapterMatchingScreen;
