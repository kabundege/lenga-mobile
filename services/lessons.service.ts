import type { StrapiLesson, StrapiLessonChapter, StrapiLessonVideo, StrapiListResponse, StrapiMatching, StrapiMatchingAnswer, StrapiMatchingQuestion, StrapiQA, StrapiQuiz } from '@/types/api';
import api from '@/utils/api';

export function getLessonsList(locale: string) {
  return api.get<StrapiListResponse<StrapiLesson>>('/api/lessons', {
    params: {
      locale,
      populate: '*',
      sort: 'createdAt:asc',
    },
  });
}


export function getChaptersList(locale: string) {
  return api.get<StrapiListResponse<StrapiLessonChapter>>('/api/lesson-chapters', {
    params: {
      locale,
      populate: '*',
    },
  });
}

export function getVideosList(locale: string) {
  return api.get<StrapiListResponse<StrapiLessonVideo>>('/api/lesson-videos', {
    params: {
      locale,
      populate: '*',
    },
  });
}

export function getQuizzesList(locale: string) {
  return api.get<StrapiListResponse<StrapiQuiz>>('/api/quizzes', {
    params: {
      locale,
      populate: '*',
    },
  });
}

export function getQAsList(locale: string) {
  return api.get<StrapiListResponse<StrapiQA>>('/api/qas', {
    params: {
      locale,
      populate: '*',
    },
  });
}

export function getMatchingsList(locale: string) {
  return api.get<StrapiListResponse<StrapiMatching>>('/api/matchings', {
    params: { locale, populate: '*' },
  });
}

export function getMatchingQuestionsList(locale: string) {
  return api.get<StrapiListResponse<StrapiMatchingQuestion>>('/api/matching-questions', {
    params: { locale, populate: '*' },
  });
}

export function getMatchingAnswersList(locale: string) {
  return api.get<StrapiListResponse<StrapiMatchingAnswer>>('/api/matching-answers', {
    params: { locale, populate: '*' },
  });
}
