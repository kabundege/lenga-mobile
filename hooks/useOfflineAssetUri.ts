import { useAppSelector } from '@/hooks/useRedux';
import { toAbsoluteMediaUrl } from '@/utils/offlineMedia';

export function useOfflineAssetUri(rawUrl?: string | null) {
  const absoluteUrl = toAbsoluteMediaUrl(rawUrl);
  const localUri = useAppSelector((state) =>
    absoluteUrl ? state.offlineContent.assetByRemoteUrl[absoluteUrl] : undefined
  );
  return localUri ?? absoluteUrl;
}
