import { useCourseByDocumentId } from '@/hooks/useCourses';
import { useEnrollCourse } from '@/hooks/useEnrollments';
import { useAppSelector } from '@/hooks/useRedux';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';

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

  const topics = useMemo(() => course?.topics ?? [], [course]);
  const isEnrolled = useMemo(() => {
    return user?.enrollments?.some((e) =>
      course?.enrollments?.some((ce) => ce.id === e.id)
    ) ?? false;
  }, [user, course]);

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
