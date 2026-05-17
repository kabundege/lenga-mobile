import type { QueryClient } from '@tanstack/react-query';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { strapiEntities } from '@/db/schema';
import { LESSON_GRAPH_COLLECTION_JOBS } from '@/db/sync/lessonGraphCollections';

/**
 * Seeds TanStack lesson-graph queries from SQLite when the in-memory/async-storage cache has no lesson list yet.
 */
export function hydrateLessonQueryCacheFromSQLite(queryClient: QueryClient, locale: string): void {
  for (const job of LESSON_GRAPH_COLLECTION_JOBS) {
    const rows = db
      .select()
      .from(strapiEntities)
      .where(
        and(
          eq(strapiEntities.collection, job.collection),
          eq(strapiEntities.locale, locale),
          eq(strapiEntities.isDeleted, false),
        ),
      )
      .all();

    if (rows.length === 0) continue;

    const entities: unknown[] = [];
    for (const row of rows) {
      try {
        entities.push(JSON.parse(row.payloadJson));
      } catch {
        continue;
      }
    }
    if (entities.length === 0) continue;

    queryClient.setQueryData(job.queryKeyForLocale(locale), {
      data: {
        data: entities,
        meta: {
          pagination: {
            page: 1,
            pageCount: 1,
            pageSize: entities.length,
            total: entities.length,
          },
        },
      },
    });
  }
}
