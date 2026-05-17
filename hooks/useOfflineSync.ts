import { useCallback, useEffect, useRef } from 'react';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { syncLessonMediaAssets } from '@/store/slices/offlineContentSlice';
import { selectIsAnySyncing, resetSyncedOfflineAssets } from '@/store/slices/offlineAssetsSlice';
import { resetOfflineMediaDownloads } from '@/store/slices/offlineMediaSlice';
import * as lessonsService from '@/services/lessons.service';
import { hydrateLessonQueryCacheFromSQLite } from '@/db/sync/hydrateLessonQueryCacheFromSQLite';
import { persistLessonContentQueryCache } from '@/db/sync/persistLessonContentQueryCache';
import { useNetworkStatus } from '@/components/providers/NetworkProvider';
import { api_keys } from '@/hooks/useLessons';
import { lessonRootListCacheIsEmpty } from '@/utils/lessonContentQueryCache';
import { clearOfflineMediaDirectory } from '@/utils/offlineMedia';

const STALE_TIME_MS = 5 * 60 * 1000;

type LessonContentQuerySpec = {
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
};

function getLessonContentQuerySpecs(locale: string): LessonContentQuerySpec[] {
  return [
    {
      queryKey: api_keys.lessons(locale),
      queryFn: () => lessonsService.getLessonsList(locale),
    },
    {
      queryKey: api_keys.chapters(locale),
      queryFn: () => lessonsService.getChaptersList(locale),
    },
    {
      queryKey: api_keys.videos(locale),
      queryFn: () => lessonsService.getVideosList(locale),
    },
    {
      queryKey: api_keys.quizzes(locale),
      queryFn: () => lessonsService.getQuizzesList(locale),
    },
    {
      queryKey: api_keys.qas(locale),
      queryFn: () => lessonsService.getQAsList(locale),
    },
    {
      queryKey: api_keys.matchings(locale),
      queryFn: () => lessonsService.getMatchingsList(locale),
    },
    {
      queryKey: api_keys.matchingQuestions(locale),
      queryFn: () => lessonsService.getMatchingQuestionsList(locale),
    },
    {
      queryKey: api_keys.matchingAnswers(locale),
      queryFn: () => lessonsService.getMatchingAnswersList(locale),
    },
  ];
}

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
  const { isOffline } = useNetworkStatus();
  const started = useRef(false);

  const syncAllLessonContent = useCallback(async () => {
    const specs = getLessonContentQuerySpecs(locale);
    await Promise.all(
      specs.map((spec) =>
        queryClient.fetchQuery({
          ...spec,
          staleTime: STALE_TIME_MS,
        }),
      ),
    );

    try {
      persistLessonContentQueryCache(queryClient, locale);
    } catch (err) {
      console.error('[useOfflineSync] SQLite persist failed:', err);
    }

    await dispatch(syncLessonMediaAssets({ queryClient, locale })).unwrap();
  }, [dispatch, locale, queryClient]);

  /**
   * Pull-to-refresh: load fresh API data from the network, wipe persisted
   * offline file mappings and on-disk `offline-media`, then re-download assets.
   * Returns false when the network fetch fails (offline); caller should fall back to cache refetch.
   */
  const refreshAllLessonOfflineData = useCallback(async (): Promise<boolean> => {
    const specs = getLessonContentQuerySpecs(locale);
    try {
      await Promise.all(
        specs.map((spec) =>
          queryClient.fetchQuery({
            ...spec,
            staleTime: 0,
            networkMode: 'online',
          }),
        ),
      );
    } catch {
      return false;
    }

    try {
      persistLessonContentQueryCache(queryClient, locale);
    } catch (err) {
      console.error('[useOfflineSync] SQLite persist failed:', err);
    }

    dispatch(resetSyncedOfflineAssets());
    dispatch(resetOfflineMediaDownloads());
    clearOfflineMediaDirectory();

    await dispatch(syncLessonMediaAssets({ queryClient, locale })).unwrap();
    return true;
  }, [dispatch, locale, queryClient]);

  useEffect(() => {
    if (!jwt || !isOffline) return;
    if (!lessonRootListCacheIsEmpty(queryClient, locale)) return;
    try {
      hydrateLessonQueryCacheFromSQLite(queryClient, locale);
    } catch (err) {
      console.error('[useOfflineSync] SQLite → Query hydrate failed:', err);
    }
  }, [jwt, isOffline, locale, queryClient]);

  useEffect(() => {
    if (!jwt || isSyncing || started.current) return;
    started.current = true;

    syncAllLessonContent().catch(() => null);
  }, [jwt, isSyncing, syncAllLessonContent]);

  return {
    isSyncing,
    syncAllLessonContent,
    refreshAllLessonOfflineData,
  };
}
