import type { StrapiLesson, StrapiLessonChapter, StrapiLessonVideo, StrapiListResponse, StrapiMatching, StrapiMatchingAnswer, StrapiMatchingQuestion, StrapiQA, StrapiQuiz } from '@/types/api';
import api from '@/utils/api';

const ALL_ITEMS_PAGE_SIZE = 1000;

export function getLessonsList(locale: string) {
  return api.get<StrapiListResponse<StrapiLesson>>('/api/lessons', {
    params: {
      locale,
      populate: '*',
      sort: 'createdAt:asc',
      'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE,
    },
  });
}


export function getChaptersList(locale: string) {
  return api.get<StrapiListResponse<StrapiLessonChapter>>('/api/lesson-chapters', {
    params: {
      locale,
      populate: '*',
      'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE,
    },
  });
}

export function getVideosList(locale: string) {
  return api.get<StrapiListResponse<StrapiLessonVideo>>('/api/lesson-videos', {
    params: {
      locale,
      populate: '*',
      'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE,
    },
  });
}

export function getQuizzesList(locale: string) {
  return api.get<StrapiListResponse<StrapiQuiz>>('/api/quizzes', {
    params: {
      locale,
      populate: '*',
      'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE,
    },
  });
}

export function getQAsList(locale: string) {
  return api.get<StrapiListResponse<StrapiQA>>('/api/qas', {
    params: {
      locale,
      populate: '*',
      'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE,
    },
  });
}

export function getMatchingsList(locale: string) {
  return api.get<StrapiListResponse<StrapiMatching>>('/api/matchings', {
    params: { locale, populate: '*', 'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE },
  });
}

export function getMatchingQuestionsList(locale: string) {
  return api.get<StrapiListResponse<StrapiMatchingQuestion>>('/api/matching-questions', {
    params: { locale, populate: '*', 'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE },
  });
}

export function getMatchingAnswersList(locale: string) {
  return api.get<StrapiListResponse<StrapiMatchingAnswer>>('/api/matching-answers', {
    params: { locale, populate: '*', 'pagination[pageSize]': ALL_ITEMS_PAGE_SIZE },
  });
}
