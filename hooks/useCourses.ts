import * as coursesService from '@/services/courses.service';
import type { StrapiCourse, StrapiCourseDetail } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export const COURSE_KEYS = {
  LIST: 'courses',
  DETAIL: 'courseDetail',
} as const;

export function getCourseListKeys(locale: string) {
  return [COURSE_KEYS.LIST, { locale }] as const;
}

export function getCourseDetailKeys(documentId: string, locale: string) {
  return [COURSE_KEYS.DETAIL, { documentId, locale }] as const;
}

export function useCourses(locale: string) {
  const request = useQuery({
    queryKey: getCourseListKeys(locale),
    queryFn: () => coursesService.getCoursesList(locale),
  });
  const body = request.data?.data;
  const courses: StrapiCourse[] = Array.isArray(body?.data) ? body.data : [];
  return { ...request, courses };
}

export function useCourseByDocumentId(documentId: string, locale: string, enabled = true) {
  const request = useQuery({
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60 * 24, // 1 day
    queryKey: getCourseDetailKeys(documentId, locale),
    queryFn: () => coursesService.getCourseByDocumentId(documentId, locale),
    enabled: enabled && !!documentId,
  });
  const body = request.data?.data;
  const list = Array.isArray(body?.data) ? body.data : [];
  const course: StrapiCourseDetail | null = list.length > 0 ? list[0] : null;
  return { ...request, course };
}
