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

export const useLessons = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const request = useQuery({
    queryKey: api_keys.lessons(locale),
    queryFn: () => lessonsService.getLessonsList(locale),
  });
  const lessons = getListFromResponse<StrapiLesson>(request.data).slice().sort(compareLessonByOrder);
  return { ...request, lessons };
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
  const request = useQuery({
    queryKey: api_keys.chapters(locale),
    queryFn: () => lessonsService.getChaptersList(locale),
  });
  const chapters = getListFromResponse<StrapiLessonChapter>(request.data);
  return { ...request, chapters };
};

export const useChapterByDocumentId = (documentId: string) => {
  const { chapters, ...request } = useChapters();
  const chapter = chapters.find((chapter) => chapter.documentId === documentId);
  return { ...request, chapter };
};

export const useVideos = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const request = useQuery({
    queryKey: api_keys.videos(locale),
    queryFn: () => lessonsService.getVideosList(locale),
  });
  const videos = getListFromResponse<StrapiLessonVideo>(request.data);
  return { ...request, videos };
};

export const useChapterVideo = (chapterId: string) => {
  const { videos, ...request } = useVideos();
  const chapterVideo = videos.find((video) => video.lesson_chapter?.documentId === chapterId);
  return { ...request, chapterVideo };
};


export const useQuizzes = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const request = useQuery({
    queryKey: api_keys.quizzes(locale),
    queryFn: () => lessonsService.getQuizzesList(locale),
  });
  const quizzes = getListFromResponse<StrapiQuiz>(request.data);
  return { ...request, quizzes };
};

export const useChapterQuizzes = (chapterId: string) => {
  const { quizzes, ...request } = useQuizzes();
  const chapterQuizzes = quizzes.filter((quiz) => quiz.lesson_chapter?.documentId === chapterId);
  return { ...request, chapterQuizzes };
};

export const useQAs = () => {
  const locale = useAppSelector((s) => s.preferences.locale);
  const request = useQuery({
    queryKey: api_keys.qas(locale),
    queryFn: () => lessonsService.getQAsList(locale),
  });
  const qas = getListFromResponse<StrapiQA>(request.data);
  return { ...request, qas };
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