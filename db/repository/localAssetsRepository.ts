import { db } from '@/db/client';
import { localAssets } from '@/db/schema';

const nowIso = () => new Date().toISOString();

export function upsertLocalAssetDownloaded(remoteUrl: string, localUri: string): void {
  if (!remoteUrl) return;
  db.insert(localAssets)
    .values({
      remoteUrl,
      localUri,
      status: 'complete',
      updatedAt: nowIso(),
      lastError: null,
      attemptCount: 0,
    })
    .onConflictDoUpdate({
      target: localAssets.remoteUrl,
      set: {
        localUri,
        status: 'complete',
        updatedAt: nowIso(),
        lastError: null,
      },
    })
    .run();
}

/** Clears mirrored download rows when the app nukes Redux offline mappings (full refresh). */
export function deleteAllLocalAssetRows(): void {
  db.delete(localAssets).run();
}
