import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { syncState } from '@/db/schema';

/** Stored ISO timestamp from the last successful **full or delta** content sync. */
export const SYNC_LAST_SYNCED_AT_KEY = 'content:lastSyncedAt';

export function getLastSyncedAt(): string | null {
  const row = db.select().from(syncState).where(eq(syncState.key, SYNC_LAST_SYNCED_AT_KEY)).get();
  return row?.valueText ?? null;
}

export function setLastSyncedAt(iso: string): void {
  db.insert(syncState)
    .values({ key: SYNC_LAST_SYNCED_AT_KEY, valueText: iso })
    .onConflictDoUpdate({
      target: syncState.key,
      set: { valueText: iso },
    })
    .run();
}
