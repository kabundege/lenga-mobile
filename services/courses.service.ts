import type { StrapiCourse, StrapiCourseDetail, StrapiListResponse } from '@/types/api';
import api from '@/utils/api';

export function getCoursesList(locale: string) {
  return api.get<StrapiListResponse<StrapiCourse>>('/api/courses', {
    params: { locale, populate: '*' },
  });
}

/**
 * Fetch a single course by its documentId (Strapi documentId).
 * Matches the admin dashboard getCourseDetails API: filters by documentId, same populates.
 */
export function getCourseByDocumentId(documentId: string, locale: string) {
  return api.get<StrapiListResponse<StrapiCourseDetail>>('/api/courses', {
    params: {
      'filters[documentId][$eq]': documentId,
      locale,
      'populate[topics][populate][lessons][populate][topic]': true,
      'populate[topics][populate][lessons][populate][video_lesson_details]': true,
      'populate[courses_instructors]': true,
      'populate[course_provider_institutions]': true,
      'populate[course_categories]': true,
    },
  });
}
