import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { syncOfflineLearningContent, selectIsAnySyncing } from '@/store/slices/offlineContentSlice';

/**
 * Kicks off a background offline sync when:
 *  - The user is authenticated (jwt exists)
 *  - No sync is already running
 *
 * Safe to call from any screen; it deduplicates automatically.
 */
export function useOfflineSync() {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((s) => s.auth.jwt);
  const locale = useAppSelector((s) => s.preferences.locale);
  const isSyncing = useAppSelector(selectIsAnySyncing);
  const dataFetchStatus = useAppSelector((s) => s.offlineContent.dataFetchStatus);
  const started = useRef(false);

  useEffect(() => {
    if (!jwt) return;
    if (isSyncing) return;
    if (started.current) return;
    if (dataFetchStatus === 'fetching') return;

    started.current = true;
    dispatch(syncOfflineLearningContent({ locale })).catch(() => null);
  }, [jwt, locale, isSyncing, dataFetchStatus, dispatch]);
}
