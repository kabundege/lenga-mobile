import { useCourseByDocumentId } from '@/hooks/useCourses';
import { useEnrollCourse } from '@/hooks/useEnrollments';
import { useAppSelector } from '@/hooks/useRedux';
import type { StrapiCourseDetail, StrapiTopicWithLessons } from '@/types/api';
import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

export function useCourseDetail() {
  const params = useLocalSearchParams<{ courseId: string }>();
  const courseId =
    typeof params.courseId === 'string' ? params.courseId : params.courseId?.[0] ?? '';
  const locale = useAppSelector((s) => s.preferences.locale);
  const user = useAppSelector((s) => s.auth.user);

  const { course, isLoading, isRefetching, error, refetch } = useCourseByDocumentId(
    courseId,
    locale
  );
  const enrollMutation = useEnrollCourse();

  const topics = (course?.topics ?? []) as StrapiTopicWithLessons[];
  const isEnrolled =
    user?.enrollments?.some((e) =>
      (course as StrapiCourseDetail)?.enrollments?.some((ce) => ce.id === e.id)
    ) ?? false;

  const handleEnroll = useCallback(() => {
    if (!user || !course) return;
    enrollMutation.mutate({
      users_permissions_user: user.id,
      course: course.id,
      locale,
      enrollment_status: 'Enrolled',
    });
  }, [user, course, locale, enrollMutation]);

  return {
    courseId,
    course,
    user,
    locale,
    topics,
    isEnrolled,
    isLoading,
    isRefetching,
    error,
    refetch,
    enrollMutation,
    handleEnroll,
  };
}
