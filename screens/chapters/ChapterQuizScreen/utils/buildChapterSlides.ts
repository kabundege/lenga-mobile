import type { StrapiMatching, StrapiQuiz } from "@/types/api";
import type { ChapterSlide } from "../types";

/** Strapi may return a relation as `T[]` or `{ data: T[] }`. */
export const unwrapStrapiRelationList = <T,>(
  rel: T[] | { data: T[] } | null | undefined,
): T[] => {
  if (rel == null) return [];
  if (Array.isArray(rel)) return rel;
  const inner = rel.data;
  return Array.isArray(inner) ? inner : [];
};

export const buildChapterSlides = (
  chapterQuizzes: StrapiQuiz[],
  chapterMatchings: StrapiMatching[],
): ChapterSlide[] => {
  const sortedQuizzes = chapterQuizzes
    .slice()
    .sort((a, b) => a.order - b.order);
  const entries: { order: number; slide: ChapterSlide }[] = [
    ...sortedQuizzes.map((quiz) => ({
      order: quiz.order,
      slide: { kind: "quiz" as const, quiz },
    })),
    ...chapterMatchings.map((matching) => ({
      order: matching.order,
      slide: { kind: "matching" as const, matching },
    })),
  ];
  entries.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    if (a.slide.kind !== b.slide.kind) return a.slide.kind === "quiz" ? -1 : 1;
    const idA =
      a.slide.kind === "quiz"
        ? a.slide.quiz.documentId
        : a.slide.matching.documentId;
    const idB =
      b.slide.kind === "quiz"
        ? b.slide.quiz.documentId
        : b.slide.matching.documentId;
    return idA.localeCompare(idB);
  });
  return entries.map((e) => e.slide);
};
