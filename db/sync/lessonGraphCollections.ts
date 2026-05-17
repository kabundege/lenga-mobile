import type { StrapiCollection } from '@/db/repository/strapiEntitiesRepository';
import { api_keys } from '@/hooks/useLessons';

export type LessonGraphCollectionJob = {
  collection: StrapiCollection;
  queryKeyForLocale: (locale: string) => readonly unknown[];
};

/** Single source for lesson-graph collection keys ↔ TanStack Query keys ↔ SQLite rows. */
export const LESSON_GRAPH_COLLECTION_JOBS: LessonGraphCollectionJob[] = [
  { collection: 'lessons', queryKeyForLocale: (l) => api_keys.lessons(l) },
  { collection: 'lesson-chapters', queryKeyForLocale: (l) => api_keys.chapters(l) },
  { collection: 'lesson-videos', queryKeyForLocale: (l) => api_keys.videos(l) },
  { collection: 'quizzes', queryKeyForLocale: (l) => api_keys.quizzes(l) },
  { collection: 'qas', queryKeyForLocale: (l) => api_keys.qas(l) },
  { collection: 'matchings', queryKeyForLocale: (l) => api_keys.matchings(l) },
  { collection: 'matching-questions', queryKeyForLocale: (l) => api_keys.matchingQuestions(l) },
  { collection: 'matching-answers', queryKeyForLocale: (l) => api_keys.matchingAnswers(l) },
];
