import * as lessonsService from '@/services/lessons.service';
import { useQuery } from '@tanstack/react-query';
import type { StrapiLesson, StrapiLessonChapter, StrapiLessonVideo, StrapiQA, StrapiQuiz } from '@/types/api';
import { useAppSelector } from './useRedux';

export const API_KEYS = {
  LIST: 'lessons',
  CHAPTERS: 'chapters',
  VIDEOS: 'videos',
  QUIZZES: 'quizzes',
  QAS: 'qas',
} as const;

export const api_keys = {
  lessons: (locale: string) => [API_KEYS.LIST, { locale }] as const,
  chapters: (locale: string) => [API_KEYS.CHAPTERS, { locale }] as const,
  videos: (locale: string) => [API_KEYS.VIDEOS, { locale }] as const,
  quizzes: (locale: string) => [API_KEYS.QUIZZES, { locale }] as const,
  qas: (locale: string) => [API_KEYS.QAS, { locale }] as const,
}

const getListFromResponse = <T extends { documentId: string }>(response?: { data?: { data?: T[] } }) => {
  return Array.isArray(response?.data?.data) ? response.data.data : [];
};

const compareLessonByOrder = (a: StrapiLesson, b: StrapiLesson) => a.order - b.order;

/**
 * Merges online data on top of offline cache. Offline is always the baseline;
 * fresh network data replaces it when available.
 */
function mergeOfflineFirst<T extends { documentId: string }>(online: T[], offline: T[]): T[] {
  if (online.length > 0) return online;
  return offline;
}

export const useLessons = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const offlineLessons = useAppSelector((s) => s.offlineContent.lessons);
  const hasOfflineData = offlineLessons.length > 0;

  const request = useQuery({
    queryKey: api_keys.lessons(locale),
    queryFn: () => lessonsService.getLessonsList(locale),
    retry: hasOfflineData ? 0 : 2,
  });

  const onlineLessons = getListFromResponse<StrapiLesson>(request.data);
  const lessons = mergeOfflineFirst(onlineLessons, offlineLessons).slice().sort(compareLessonByOrder);
  const isLoading = request.isLoading && !hasOfflineData;
  const error = hasOfflineData ? null : request.error;

  return { ...request, lessons, isLoading, error };
};

export const useLessonByDocumentId = (documentId: string) => {
  const { lessons, ...request } = useLessons();
  const lesson = lessons.find((lesson) => lesson.documentId === documentId);
  const lessonChapters = lesson?.lesson_chapters ?? [];
  const orderedLessonChapters = lessonChapters.slice().sort((a, b) => a.order - b.order);
  return { ...request, lesson, lessonChapters: orderedLessonChapters };
};

export const useChapters = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const offlineChapters = useAppSelector((s) => s.offlineContent.chapters);
  const hasOfflineData = offlineChapters.length > 0;

  const request = useQuery({
    queryKey: api_keys.chapters(locale),
    queryFn: () => lessonsService.getChaptersList(locale),
    retry: hasOfflineData ? 0 : 2,
  });

  const onlineChapters = getListFromResponse<StrapiLessonChapter>(request.data);
  const chapters = mergeOfflineFirst(onlineChapters, offlineChapters);
  const isLoading = request.isLoading && !hasOfflineData;
  const error = hasOfflineData ? null : request.error;

  return { ...request, chapters, isLoading, error };
};

export const useChapterByDocumentId = (documentId: string) => {
  const { chapters, ...request } = useChapters();
  const chapter = chapters.find((chapter) => chapter.documentId === documentId);
  return { ...request, chapter };
};

export const useVideos = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const offlineVideos = useAppSelector((s) => s.offlineContent.videos);
  const hasOfflineData = offlineVideos.length > 0;

  const request = useQuery({
    queryKey: api_keys.videos(locale),
    queryFn: () => lessonsService.getVideosList(locale),
    retry: hasOfflineData ? 0 : 2,
  });

  const onlineVideos = getListFromResponse<StrapiLessonVideo>(request.data);
  const videos = mergeOfflineFirst(onlineVideos, offlineVideos);
  const isLoading = request.isLoading && !hasOfflineData;
  const error = hasOfflineData ? null : request.error;

  return { ...request, videos, isLoading, error };
};

export const useChapterVideo = (chapterId: string) => {
  const { videos, ...request } = useVideos();
  const chapterVideo = videos.find((video) => video.lesson_chapter?.documentId === chapterId);
  return { ...request, chapterVideo };
};


export const useQuizzes = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const offlineQuizzes = useAppSelector((s) => s.offlineContent.quizzes);
  const hasOfflineData = offlineQuizzes.length > 0;

  const request = useQuery({
    queryKey: api_keys.quizzes(locale),
    queryFn: () => lessonsService.getQuizzesList(locale),
    retry: hasOfflineData ? 0 : 2,
  });

  const onlineQuizzes = getListFromResponse<StrapiQuiz>(request.data);
  const quizzes = mergeOfflineFirst(onlineQuizzes, offlineQuizzes);
  const isLoading = request.isLoading && !hasOfflineData;
  const error = hasOfflineData ? null : request.error;

  return { ...request, quizzes, isLoading, error };
};

export const useChapterQuizzes = (chapterId: string) => {
  const { quizzes, ...request } = useQuizzes();
  const chapterQuizzes = quizzes.filter((quiz) => quiz.lesson_chapter?.documentId === chapterId);
  return { ...request, chapterQuizzes };
};

export const useQAs = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const offlineQAs = useAppSelector((s) => s.offlineContent.qas);
  const hasOfflineData = offlineQAs.length > 0;

  const request = useQuery({
    queryKey: api_keys.qas(locale),
    queryFn: () => lessonsService.getQAsList(locale),
    retry: hasOfflineData ? 0 : 2,
  });

  const onlineQAs = getListFromResponse<StrapiQA>(request.data);
  const qas = mergeOfflineFirst(onlineQAs, offlineQAs);
  const isLoading = request.isLoading && !hasOfflineData;
  const error = hasOfflineData ? null : request.error;

  return { ...request, qas, isLoading, error };
};

export const useQuizQAs = (quizId: string) => {
  const { qas, ...request } = useQAs();
  const quizQas = qas.filter((qa) => qa.quiz?.documentId === quizId);
  return { ...request, quizQas };
};

export const useQAByDocumentId = (documentId: string) => {
  const { qas, ...request } = useQAs();
  const qa = qas.find((qa) => qa.documentId === documentId);
  return { ...request, qa };
};
