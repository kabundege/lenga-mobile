import { EmptyListWithSkeleton } from "@/components/empty-states";
import QuizQACard from "@/components/cards/QuizQACard";
import { MatchingGameBoard } from "../../matching/MatchingGameBoard";
import { MatchingGhostCard } from "../../matching/MatchingGhostCard";
import { chapterMatchingStyles as matchingStyles } from "../../matching/chapterMatchingStyles";
import { chapterQuizScreenStyles as styles } from "../chapterQuizScreen.styles";
import { globalStyles } from "@/utils/styles";
import type { StrapiMatching, StrapiQA, StrapiQuiz } from "@/types/api";
import type { ReactElement, RefObject } from "react";
import { ScrollView, View } from "react-native";
import type { RefreshControlProps } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { ChapterSlide } from "../types";
import { ChapterQuizQAList } from "./ChapterQuizQAList";

type ChapterQuizSlideAreaProps = {
  refreshControl: ReactElement<RefreshControlProps>;
  isLoading: boolean;
  chapterSlides: ChapterSlide[];
  activeSlide: ChapterSlide | undefined;
  activeQuiz: StrapiQuiz | undefined;
  activeMatching: StrapiMatching | undefined;
  qas: StrapiQA[];
  hasQuizContext: boolean;
  quizContextDescription: string | null;
  qasScrollRef: RefObject<ScrollView | null>;
  matchingScrollRef: RefObject<ScrollView | null>;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostVisible: SharedValue<boolean>;
  ghostThumb: string | null;
  handleDragStartGhost: (thumbUri: string | null) => void;
  handleDragEndGhost: () => void;
  quizAnswered: boolean;
  onQuizRightAnswer: () => void;
  onMatchingAllMatched: () => void;
};

export const ChapterQuizSlideArea = ({
  refreshControl,
  isLoading,
  chapterSlides,
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
  quizAnswered,
  onQuizRightAnswer,
  onMatchingAllMatched,
}: ChapterQuizSlideAreaProps) => {
  return (
    <>
      {activeSlide?.kind === "quiz" && qas.length > 0 ? (
        <ScrollView
          ref={qasScrollRef}
          style={globalStyles.flex_1}
          refreshControl={refreshControl}
          contentContainerStyle={styles.quizContent}
        >
          {hasQuizContext ? (
            <View style={styles.quizContextWrap}>
              <QuizQACard
                isContextOnly
                contextDescription={quizContextDescription}
                contextThumbnailUrl={activeQuiz?.title_image?.url}
                contextAudioUrl={activeQuiz?.title_image_audio?.url}
              />
            </View>
          ) : null}

          <View style={styles.grid}>
            <ChapterQuizQAList
              qas={qas}
              allAnswered={quizAnswered}
              onQuizRightAnswer={onQuizRightAnswer}
            />
          </View>
        </ScrollView>
      ) : activeSlide?.kind === "matching" && activeMatching ? (
        <ScrollView
          ref={matchingScrollRef}
          style={globalStyles.flex_1}
          contentContainerStyle={matchingStyles.content}
          refreshControl={refreshControl}
        >
          <MatchingGameBoard
            key={activeMatching.documentId}
            matchingId={activeMatching.documentId}
            onAllMatched={onMatchingAllMatched}
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
      ) : !isLoading && activeSlide?.kind === "quiz" && qas.length === 0 ? (
        <EmptyListWithSkeleton
          title="Nta bibazo biboneka"
          description="Nta bibazo biboneka muri uyu mwitozo."
          containerStyles={styles.emptyState}
        />
      ) : null}

      {activeSlide?.kind === "matching" ? (
        <MatchingGhostCard
          ghostX={ghostX}
          ghostY={ghostY}
          ghostVisible={ghostVisible}
          thumbUri={ghostThumb}
        />
      ) : null}
    </>
  );
};
