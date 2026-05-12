import QuizQACard from "@/components/cards/QuizQACard";
import type { StrapiQA } from "@/types/api";

type ChapterQuizQAListProps = {
  qas: StrapiQA[];
  allAnswered: boolean;
  onQuizRightAnswer: () => void;
};

export const ChapterQuizQAList = ({
  qas,
  allAnswered,
  onQuizRightAnswer,
}: ChapterQuizQAListProps) => (
  <>
    {qas.map((qaItem) => (
      <QuizQACard
        key={qaItem.documentId}
        qa={qaItem}
        qaId={qaItem.documentId}
        disabled={allAnswered}
        rightAnswerCallBack={onQuizRightAnswer}
      />
    ))}
  </>
);
