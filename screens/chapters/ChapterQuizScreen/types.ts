import type { StrapiMatching, StrapiQuiz } from "@/types/api";

export type ChapterSlide =
  | { kind: "quiz"; quiz: StrapiQuiz }
  | { kind: "matching"; matching: StrapiMatching };
