import api from '@/utils/api';
import type { StrapiCourse, StrapiCourseDetail, StrapiListResponse } from '@/types/api';

export function getCoursesList(locale: string) {
  return api.get<StrapiListResponse<StrapiCourse>>('/api/courses', {
    params: { locale, populate: '*' },
  });
}

export function getCourseByDocumentId(documentId: string, locale: string) {
  return api.get<StrapiListResponse<StrapiCourseDetail>>('/api/courses', {
    params: {
      'filters[documentId][$eq]': documentId,
      locale,
      'populate[topics][populate][lessons][populate][topic]': true,
      'populate[topics][populate][lessons][populate][lesson_details]': true,
      'populate[courses_instructors]': true,
      'populate[course_provider_institutions]': true,
      'populate[course_categories]': true,
    },
  });
}
