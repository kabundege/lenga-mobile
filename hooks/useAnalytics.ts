import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { clearPendingFullName } from '@/store/slices/authSlice';
import * as analyticsService from '@/services/analytics.service';
import type { ExtendedProfileInput } from '@/types/analytics';
import type { StrapiLesson } from '@/types/api';
import {
  computeLessonProgress,
  markChapterCompleted,
} from '@/utils/analytics/chapterProgress';
import { trackAnalytics } from '@/utils/analytics/trackAnalytics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export const ANALYTICS_KEYS = {
  extendedProfile: (userId?: number) => ['analytics', 'extended-profile', userId] as const,
};

const toLessonNumericId = (lesson: StrapiLesson): number => Number(lesson.id);

export function useExtendedProfile(enabled = true) {
  const userId = useAppSelector((s) => s.auth.user?.id);

  return useQuery({
    queryKey: ANALYTICS_KEYS.extendedProfile(userId),
    queryFn: () => analyticsService.findExtendedProfileByUserId(userId!),
    enabled: enabled && userId != null,
  });
}

export function useSaveExtendedProfile(options?: { onSuccess?: () => void }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const userId = useAppSelector((s) => s.auth.user?.id);
  const pendingFullName = useAppSelector((s) => s.auth.pendingFullName);

  return useMutation({
    mutationFn: async (input: ExtendedProfileInput) => {
      if (userId == null) throw new Error('Not authenticated');

      const payload: ExtendedProfileInput = {
        ...input,
        full_name: input.full_name?.trim() || pendingFullName?.trim() || undefined,
      };

      const current = await analyticsService.findExtendedProfileByUserId(userId);
      if (current) {
        return analyticsService.updateExtendedProfile(current.documentId, payload);
      }
      return analyticsService.createExtendedProfile(userId, payload);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(ANALYTICS_KEYS.extendedProfile(userId), profile);
      dispatch(clearPendingFullName());
      options?.onSuccess?.();
    },
  });
}

export function useAnalyticsTracking() {
  const userId = useAppSelector((s) => s.auth.user?.id);

  const recordLessonOpened = useCallback(
    (lesson: StrapiLesson) => {
      if (userId == null) return;

      trackAnalytics(async () => {
        const lessonId = toLessonNumericId(lesson);
        const existing = await analyticsService.findModuleAttendance(userId, lessonId);
        if (existing) return;

        await analyticsService.createModuleAttendance({
          userId,
          lessonId,
          status: 'started',
          progress_percentage: 0,
        });
      }, 'recordLessonOpened');
    },
    [userId],
  );

  const recordChapterCompleted = useCallback(
    (lesson: StrapiLesson, chapterDocumentId: string) => {
      if (userId == null) return;

      trackAnalytics(async () => {
        const lessonId = toLessonNumericId(lesson);
        const totalChapters = lesson.lesson_chapters?.length ?? 0;
        const completedIds = await markChapterCompleted(
          userId,
          lesson.documentId,
          chapterDocumentId,
        );
        const { progress_percentage, status } = computeLessonProgress(
          completedIds.length,
          totalChapters,
        );
        const completed_at = status === 'completed' ? new Date().toISOString() : null;

        const existing = await analyticsService.findModuleAttendance(userId, lessonId);
        if (existing) {
          await analyticsService.updateModuleAttendance(existing.documentId, {
            status,
            progress_percentage,
            completed_at,
          });
          return;
        }

        await analyticsService.createModuleAttendance({
          userId,
          lessonId,
          status,
          progress_percentage,
          completed_at,
        });
      }, 'recordChapterCompleted');
    },
    [userId],
  );

  const submitQuizResult = useCallback(
    (params: {
      quizId: number;
      score: number;
      totalQuestions: number;
      isPassed: boolean;
    }) => {
      if (userId == null) return;

      trackAnalytics(
        () =>
          analyticsService.createAssessmentSubmission({
            userId,
            quizId: params.quizId,
            score: params.score,
            total_questions: params.totalQuestions,
            is_passed: params.isPassed,
          }),
        'submitQuizResult',
      );
    },
    [userId],
  );

  const submitMatchingResult = useCallback(
    (params: {
      matchingId: number;
      score: number;
      totalQuestions: number;
      isPassed: boolean;
    }) => {
      if (userId == null) return;

      trackAnalytics(
        () =>
          analyticsService.createAssessmentSubmission({
            userId,
            matchingId: params.matchingId,
            score: params.score,
            total_questions: params.totalQuestions,
            is_passed: params.isPassed,
          }),
        'submitMatchingResult',
      );
    },
    [userId],
  );

  return useMemo(
    () => ({
      recordLessonOpened,
      recordChapterCompleted,
      submitQuizResult,
      submitMatchingResult,
    }),
    [recordChapterCompleted, recordLessonOpened, submitMatchingResult, submitQuizResult],
  );
}
