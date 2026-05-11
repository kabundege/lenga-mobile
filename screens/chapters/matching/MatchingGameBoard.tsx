import MatchingQuestionCard, {
  type AnswerLayout,
  type AnswerPositionEntry,
} from '@/components/cards/MatchingQuestionCard';
import MatchingAnswerCard from '@/components/cards/MatchingAnswerCard';
import { useLessonAudio } from '@/hooks/useLessonAudio';
import {
  useMatchingAnswersByMatchingId,
  useMatchingQuestionsByMatchingId,
} from '@/hooks/useLessons';
import type { StrapiMatchingAnswer } from '@/types/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { CORRECT_ANSWER_AUDIO_URL, WRONG_ANSWER_AUDIO_URL } from './constants';
import { chapterMatchingStyles as styles } from './chapterMatchingStyles';

export type MatchingGameBoardProps = {
  matchingId: string;
  onAllMatched: () => void;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostVisible: SharedValue<boolean>;
  onDragStartGhost: (thumbUri: string | null) => void;
  onDragEndGhost: () => void;
};

export const MatchingGameBoard = ({
  matchingId,
  onAllMatched,
  ghostX,
  ghostY,
  ghostVisible,
  onDragStartGhost,
  onDragEndGhost,
}: MatchingGameBoardProps) => {
  const { questions } = useMatchingQuestionsByMatchingId(matchingId);
  const { answers } = useMatchingAnswersByMatchingId(matchingId);

  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  /** answerId -> questionId for incorrect drops (user can drag the piece from that answer). */
  const [wrongPlacements, setWrongPlacements] = useState<Record<string, string>>({});
  const [draggingQuestion, setDraggingQuestion] = useState<string | null>(null);

  useEffect(() => {
    setMatchedPairs({});
    setWrongPlacements({});
    setDraggingQuestion(null);
  }, [matchingId]);

  const answerLayouts = useRef<Record<string, AnswerLayout>>({});

  const answerPositionsShared = useSharedValue<AnswerPositionEntry[]>([]);
  const hoveredAnswerId = useSharedValue('');

  const { audioLoaded: correctAudioLoaded, toggleAudio: playCorrectAudio } =
    useLessonAudio(CORRECT_ANSWER_AUDIO_URL);

  const { audioLoaded: wrongAudioLoaded, toggleAudio: playWrongAudio } =
    useLessonAudio(WRONG_ANSWER_AUDIO_URL);

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

  const registerAnswerLayout = useCallback(
    (answerId: string, layout: AnswerLayout) => {
      answerLayouts.current[answerId] = layout;
      answerPositionsShared.value = Object.entries(answerLayouts.current).map(([id, pos]) => ({
        id,
        ...pos,
      }));
    },
    [answerPositionsShared]
  );

  const handleDragStart = useCallback(
    (questionId: string, thumbUri: string | null) => {
      setDraggingQuestion(questionId);
      onDragStartGhost(thumbUri);
    },
    [onDragStartGhost]
  );

  const clearWrongForQuestion = useCallback((questionId: string) => {
    setWrongPlacements((prev) => {
      const next = { ...prev };
      for (const [aid, qid] of Object.entries(next)) {
        if (qid === questionId) delete next[aid];
      }
      return next;
    });
  }, []);

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
        const designatedAnswerId = question?.matching_answer?.documentId;
        const isStrictPair = !!designatedAnswerId && designatedAnswerId === answerId;
        /** Question has no linked answer in CMS. */
        const isWildQuestion = !designatedAnswerId;
        /** No question in this game names this answer as its pair. */
        const isWildAnswer = !questions.some((q) => q.matching_answer?.documentId === answerId);
        /**
         * Free/random pairing is valid only when both sides are wildcard.
         * If either side has a designated pair, enforce strict matching.
         */
        const isCorrect = isStrictPair || (isWildQuestion && isWildAnswer);

        if (isCorrect) {
          clearWrongForQuestion(questionId);
          setMatchedPairs((prev) => ({ ...prev, [questionId]: answerId }));
          if (correctAudioLoaded) {
            void playCorrectAudio();
          }
        } else {
          let shouldPlayWrong = false;
          setWrongPlacements((prev) => {
            shouldPlayWrong = prev[answerId] !== questionId;
            const next = { ...prev };
            for (const [aid, qid] of Object.entries(next)) {
              if (qid === questionId) delete next[aid];
            }
            next[answerId] = questionId;
            return next;
          });
          if (shouldPlayWrong && wrongAudioLoaded) {
            void playWrongAudio();
          }
        }
        return;
      }
    },
    [
      questions,
      correctAudioLoaded,
      playCorrectAudio,
      wrongAudioLoaded,
      playWrongAudio,
      onDragEndGhost,
      clearWrongForQuestion,
    ]
  );

  const matchedAnswerIds = useMemo(() => new Set(Object.values(matchedPairs)), [matchedPairs]);

  const matchedQuestionsByAnswerId = useMemo(() => {
    const map: Record<string, typeof questions> = {};
    for (const q of questions) {
      const aid = matchedPairs[q.documentId];
      if (!aid) continue;
      if (!map[aid]) map[aid] = [];
      map[aid].push(q);
    }
    return map;
  }, [questions, matchedPairs]);

  return (
    <View style={styles.columns}>
      <View style={styles.column}>
        {questions.map((q) => {
          const matchedAid = matchedPairs[q.documentId];
          const showMatchedCheck = !!matchedAid && q.matching_answer?.documentId === matchedAid;
          return (
            <MatchingQuestionCard
              key={q.documentId}
              question={q}
              isMatched={!!matchedAid}
              showMatchedCheck={showMatchedCheck}
              isPlacedWrong={Object.values(wrongPlacements).includes(q.documentId)}
              isDraggingThis={draggingQuestion === q.documentId}
              ghostX={ghostX}
              ghostY={ghostY}
              ghostVisible={ghostVisible}
              hoveredAnswerId={hoveredAnswerId}
              answerPositionsShared={answerPositionsShared}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </View>

      <View style={styles.separator} />

      <View style={styles.column}>
        {shuffledAnswers.map((a) => {
          const wrongQid = wrongPlacements[a.documentId];
          const wrongQ = wrongQid ? questions.find((q) => q.documentId === wrongQid) : undefined;
          const mqList = matchedQuestionsByAnswerId[a.documentId] ?? [];
          const showMatchedCheck = mqList.some((mq) => mq.matching_answer?.documentId === a.documentId);
          return (
            <MatchingAnswerCard
              key={a.documentId}
              answer={a}
              isMatched={matchedAnswerIds.has(a.documentId)}
              showMatchedCheck={showMatchedCheck}
              showWrongCheck
              emphasizeWrongCard
              matchedQuestions={mqList}
              hoveredAnswerId={hoveredAnswerId}
              onRegisterLayout={registerAnswerLayout}
              ghostX={ghostX}
              ghostY={ghostY}
              ghostVisible={ghostVisible}
              answerPositionsShared={answerPositionsShared}
              wrongQuestionId={wrongQid ?? null}
              wrongQuestionThumbUrl={wrongQ?.thumbnail?.url ?? null}
              isDraggingWrongPiece={wrongQid != null && draggingQuestion === wrongQid}
              onWrongDragStart={handleDragStart}
              onWrongDragEnd={handleDragEnd}
            />
          );
        })}
      </View>
    </View>
  );
};
