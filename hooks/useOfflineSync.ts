import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { syncLessonMediaAssets } from '@/store/slices/offlineContentSlice';
import { selectIsAnySyncing } from '@/store/slices/offlineAssetsSlice';
import * as lessonsService from '@/services/lessons.service';
import { api_keys } from '@/hooks/useLessons';

/**
 * On mount (when authenticated), ensures all API data is in the TanStack Query
 * cache then kicks off background media-asset downloads.
 *
 * Safe to call from any screen — deduplicates via `started` ref.
 */
export function useOfflineSync() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const jwt = useAppSelector((s) => s.auth.jwt);
  const locale = useAppSelector((s) => s.preferences.locale);
  const isSyncing = useAppSelector(selectIsAnySyncing);
  const started = useRef(false);
  const syncAllLessonContent = useCallback(async () => {
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: api_keys.lessons(locale),
        queryFn: () => lessonsService.getLessonsList(locale),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.fetchQuery({
        queryKey: api_keys.chapters(locale),
        queryFn: () => lessonsService.getChaptersList(locale),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.fetchQuery({
        queryKey: api_keys.videos(locale),
        queryFn: () => lessonsService.getVideosList(locale),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.fetchQuery({
        queryKey: api_keys.quizzes(locale),
        queryFn: () => lessonsService.getQuizzesList(locale),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.fetchQuery({
        queryKey: api_keys.qas(locale),
        queryFn: () => lessonsService.getQAsList(locale),
        staleTime: 5 * 60 * 1000,
      }),
    ]);

    await dispatch(syncLessonMediaAssets({ queryClient, locale })).unwrap();
  }, [dispatch, locale, queryClient]);

  useEffect(() => {
    if (!jwt || isSyncing || started.current) return;
    started.current = true;

    syncAllLessonContent().catch(() => null);
  }, [jwt, isSyncing, syncAllLessonContent]);

  return {
    isSyncing,
    syncAllLessonContent,
  };
}
