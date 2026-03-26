import { useAppSelector } from '@/hooks/useRedux';
import { toAbsoluteMediaUrl } from '@/utils/offlineMedia';

/**
 * Resolves a remote media URL to a local file URI when the asset has been
 * downloaded for offline use.  Falls back to the absolute remote URL if the
 * asset is not yet cached locally.
 */
export function useOfflineAssetUri(rawUrl?: string | null): string {
  const absoluteUrl = toAbsoluteMediaUrl(rawUrl);
  const localUri = useAppSelector((state) =>
    absoluteUrl ? state.offlineAssets.byRemoteUrl[absoluteUrl] : undefined,
  );
  return localUri ?? absoluteUrl;
}
