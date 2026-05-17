import { createListenerMiddleware } from '@reduxjs/toolkit';

import { deleteAllLocalAssetRows, upsertLocalAssetDownloaded } from '@/db/repository/localAssetsRepository';
import { resetSyncedOfflineAssets, setAsset } from '@/store/slices/offlineAssetsSlice';
import { toAbsoluteMediaUrl } from '@/utils/offlineMedia';

/**
 * Mirrors `offlineAssets` into SQLite so asset bookkeeping can outlive Redux-only caches.
 */
const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setAsset,
  effect: (action) => {
    const absolute = toAbsoluteMediaUrl(action.payload.remoteUrl);
    if (!absolute) return;
    upsertLocalAssetDownloaded(absolute, action.payload.localUri);
  },
});

listenerMiddleware.startListening({
  actionCreator: resetSyncedOfflineAssets,
  effect: () => {
    deleteAllLocalAssetRows();
  },
});

export const localAssetsSQLiteMirrorMiddleware = listenerMiddleware.middleware;
