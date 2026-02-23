import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { setAuthToken } from '@/utils/api';

/**
 * Syncs Redux auth jwt to API client after rehydration.
 */
export function AuthTokenSync() {
  const jwt = useAppSelector((s) => s.auth.jwt);
  useEffect(() => {
    setAuthToken(jwt);
  }, [jwt]);
  return null;
}
