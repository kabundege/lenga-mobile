import QuizQACard from "@/components/cards/QuizQACard";
import type { StrapiQA } from "@/types/api";

type ChapterQuizQAListProps = {
  qas: StrapiQA[];
  onQuizRightAnswer: () => void;
};

export const ChapterQuizQAList = ({
  qas,
  onQuizRightAnswer,
}: ChapterQuizQAListProps) => (
  <>
    {qas.map((qaItem) => (
      <QuizQACard
        key={qaItem.documentId}
        qa={qaItem}
        qaId={qaItem.documentId}
        rightAnswerCallBack={onQuizRightAnswer}
      />
    ))}
  </>
);
