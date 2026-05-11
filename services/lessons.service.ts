import type { StrapiLesson, StrapiLessonChapter, StrapiLessonVideo, StrapiListResponse, StrapiMatching, StrapiMatchingAnswer, StrapiMatchingQuestion, StrapiQA, StrapiQuiz } from '@/types/api';
import api from '@/utils/api';

/**
 * Must match Strapi `api.rest.maxLimit` (e.g. lenga-api/config/api.ts). Larger
 * `pagination[pageSize]` values are capped server-side, so we page until all
 * records are loaded for offline sync and in-app lists.
 */
const STRAPI_MAX_PAGE_SIZE = 100;

type StrapiListParams = Record<string, string | number>;

async function fetchStrapiListAllPages<T>(
  path: string,
  baseParams: StrapiListParams,
): Promise<StrapiListResponse<T>> {
  const aggregated: T[] = [];
  let page = 1;
  let total = 0;

  while (true) {
    const res = await api.get<StrapiListResponse<T>>(path, {
      params: {
        ...baseParams,
        'pagination[page]': page,
        'pagination[pageSize]': STRAPI_MAX_PAGE_SIZE,
      },
    });
    const batch = Array.isArray(res.data.data) ? res.data.data : [];
    aggregated.push(...batch);
    const pag = res.data.meta?.pagination;
    total = pag?.total ?? aggregated.length;
    if (!pag || page >= pag.pageCount || batch.length === 0) {
      break;
    }
    page += 1;
  }

  return {
    data: aggregated,
    meta: {
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: aggregated.length,
        total,
      },
    },
  };
}

export async function getLessonsList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiLesson>('/api/lessons', {
    locale,
    populate: '*',
    sort: 'createdAt:asc',
  });
  return { data };
}

export async function getChaptersList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiLessonChapter>('/api/lesson-chapters', {
    locale,
    populate: '*',
  });
  return { data };
}

export async function getVideosList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiLessonVideo>('/api/lesson-videos', {
    locale,
    populate: '*',
  });
  return { data };
}

export async function getQuizzesList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiQuiz>('/api/quizzes', {
    locale,
    populate: '*',
  });
  return { data };
}

export async function getQAsList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiQA>('/api/qas', {
    locale,
    populate: '*',
  });
  return { data };
}

export async function getMatchingsList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiMatching>('/api/matchings', {
    locale,
    populate: '*',
  });
  return { data };
}

export async function getMatchingQuestionsList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiMatchingQuestion>('/api/matching-questions', {
    locale,
    populate: '*',
  });
  return { data };
}

export async function getMatchingAnswersList(locale: string) {
  const data = await fetchStrapiListAllPages<StrapiMatchingAnswer>('/api/matching-answers', {
    locale,
    populate: '*',
  });
  return { data };
}
