import type {
  StrapiLesson,
  StrapiLessonChapter,
  StrapiLessonVideo,
  StrapiMatching,
  StrapiMatchingQuestion,
  StrapiQA,
  StrapiQuiz,
} from '@/types/api';
import { toAbsoluteMediaUrl } from '@/utils/offlineMedia';

function push(bag: Set<string>, url?: string | null) {
  const abs = toAbsoluteMediaUrl(url);
  if (abs) bag.add(abs);
}

/** Media that belongs directly to a lesson (thumbnail, audio description). */
export function collectLessonLevelMedia(lesson: StrapiLesson): string[] {
  const bag = new Set<string>();
  push(bag, lesson.thumbnail?.url);
  push(bag, lesson.audio_desc?.url);
  return Array.from(bag);
}

/** Media that belongs to a single chapter (thumbnail, audio description, video). */
export function collectChapterOnlyMedia(
  chapter: StrapiLessonChapter,
  video: StrapiLessonVideo | undefined,
): string[] {
  const bag = new Set<string>();
  push(bag, chapter.thumbnail?.url);
  push(bag, chapter.audio_desc?.url);
  if (video) push(bag, video.lesson_video?.url);
  return Array.from(bag);
}

/** Media that belongs to a single quiz (incl. title images used in quiz UI). */
export function collectQuizMediaFields(quiz: StrapiQuiz, bag: Set<string>) {
  push(bag, quiz.audio_desc?.url);
  push(bag, quiz.title_image?.url);
  push(bag, quiz.title_image_audio?.url);
}

/** Media that belongs to a single Q&A (thumbnail, audio description). */
export function collectQAMediaFields(qa: StrapiQA, bag: Set<string>) {
  push(bag, qa.thumbnail?.url);
  push(bag, qa.audio_desc?.url);
}

/** Matching game media for one chapter (audio + question/answer thumbnails). */
export function collectMatchingMediaForChapter(
  chapterDocumentId: string,
  matchings: StrapiMatching[],
  matchingQuestions: StrapiMatchingQuestion[],
  bag: Set<string>,
) {
  const chapterMatchings = matchings.filter(
    (m) => m.lesson_chapter?.documentId === chapterDocumentId,
  );
  chapterMatchings.forEach((matching) => {
    push(bag, matching.audio_desc?.url);
    const mid = matching.documentId;
    matchingQuestions
      .filter((q) => q.matching?.documentId === mid)
      .forEach((q) => {
        push(bag, q.thumbnail?.url);
        push(bag, q.matching_answer?.thumbnail?.url);
      });
  });
}

/**
 * Quiz row + all Q&A media under that quiz (same scope as offline download for a quiz).
 */
export function collectQuizSubtreeMedia(quiz: StrapiQuiz, qas: StrapiQA[]): string[] {
  const bag = new Set<string>();
  collectQuizMediaFields(quiz, bag);
  qas
    .filter((qa) => qa.quiz?.documentId === quiz.documentId)
    .forEach((qa) => collectQAMediaFields(qa, bag));
  return Array.from(bag);
}

/**
 * Chapter intro/thumbnail/audio, video, and matching (no quiz/Q&A — those are listed per quiz).
 */
export function collectChapterNonQuizMedia(
  chapter: StrapiLessonChapter,
  video: StrapiLessonVideo | undefined,
  matchings: StrapiMatching[],
  matchingQuestions: StrapiMatchingQuestion[],
): string[] {
  const bag = new Set<string>();
  push(bag, chapter.thumbnail?.url);
  push(bag, chapter.audio_desc?.url);
  if (video) push(bag, video.lesson_video?.url);
  collectMatchingMediaForChapter(chapter.documentId, matchings, matchingQuestions, bag);
  return Array.from(bag);
}

/**
 * Chapter video/thumbnails/audio + quizzes + QAs + matching for that chapter.
 */
export function collectChapterSubtreeMedia(
  chapter: StrapiLessonChapter,
  video: StrapiLessonVideo | undefined,
  quizzes: StrapiQuiz[],
  qas: StrapiQA[],
  matchings: StrapiMatching[],
  matchingQuestions: StrapiMatchingQuestion[],
): string[] {
  const bag = new Set<string>();
  push(bag, chapter.thumbnail?.url);
  push(bag, chapter.audio_desc?.url);
  if (video) push(bag, video.lesson_video?.url);

  const chapterQuizzes = quizzes.filter(
    (q) => q.lesson_chapter && q.lesson_chapter.documentId === chapter.documentId,
  );
  const quizIds = new Set(chapterQuizzes.map((q) => q.documentId));
  chapterQuizzes.forEach((quiz) => collectQuizMediaFields(quiz, bag));

  qas
    .filter((qa) => qa.quiz && quizIds.has(qa.quiz.documentId))
    .forEach((qa) => collectQAMediaFields(qa, bag));

  collectMatchingMediaForChapter(chapter.documentId, matchings, matchingQuestions, bag);

  return Array.from(bag);
}

/**
 * Full lesson tree: lesson → chapters → videos → quizzes → QAs → matchings.
 */
export function collectAllMediaForLesson(
  lesson: StrapiLesson,
  chapters: StrapiLessonChapter[],
  videos: StrapiLessonVideo[],
  quizzes: StrapiQuiz[],
  qas: StrapiQA[],
  matchings: StrapiMatching[],
  matchingQuestions: StrapiMatchingQuestion[],
): string[] {
  const bag = new Set<string>();

  collectLessonLevelMedia(lesson).forEach((u) => bag.add(u));

  const chapterIds = new Set((lesson.lesson_chapters ?? []).map((c) => c.documentId));

  chapters
    .filter((c) => chapterIds.has(c.documentId))
    .forEach((chapter) => {
      const video = videos.find(
        (v) => v.lesson_chapter && v.lesson_chapter.documentId === chapter.documentId,
      );
      collectChapterSubtreeMedia(chapter, video, quizzes, qas, matchings, matchingQuestions).forEach(
        (u) => bag.add(u),
      );
    });

  return Array.from(bag);
}

export function countOfflineProgress(
  urls: string[],
  byRemoteUrl: Record<string, string>,
): { downloaded: number; total: number } {
  const absolute = urls.map((u) => toAbsoluteMediaUrl(u)).filter(Boolean);
  if (absolute.length === 0) return { downloaded: 0, total: 0 };
  let downloaded = 0;
  for (const u of absolute) {
    if (byRemoteUrl[u]) downloaded += 1;
  }
  return { downloaded, total: absolute.length };
}
