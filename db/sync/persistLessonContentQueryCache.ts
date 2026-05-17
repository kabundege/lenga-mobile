import type { QueryClient } from '@tanstack/react-query';

import {
  deleteStrapiEntity,
  type StrapiCollection,
  upsertStrapiEntity,
} from '@/db/repository/strapiEntitiesRepository';
import { setLastSyncedAt } from '@/db/repository/syncStateRepository';
import { api_keys } from '@/hooks/useLessons';
import { getLessonContentListFromCache } from '@/utils/lessonContentQueryCache';

function readSoftDeleted(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const o = payload as Record<string, unknown>;
  return o.isDeleted === true || o.deleted === true;
}

function readDocumentId(row: unknown): string | null {
  if (!row || typeof row !== 'object') return null;
  const id = (row as { documentId?: unknown }).documentId;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

function readUpdatedAt(row: unknown): string | null {
  if (!row || typeof row !== 'object') return null;
  const u = (row as { updatedAt?: unknown }).updatedAt;
  return typeof u === 'string' && u.length > 0 ? u : null;
}

function resolveLocale(row: unknown, fallback: string): string {
  if (row && typeof row === 'object' && typeof (row as { locale?: unknown }).locale === 'string') {
    return (row as { locale: string }).locale;
  }
  return fallback;
}

function persistRows(rows: unknown[], collection: StrapiCollection, fallbackLocale: string): void {
  for (const row of rows) {
    const documentId = readDocumentId(row);
    const updatedAt = readUpdatedAt(row);
    if (!documentId || !updatedAt) continue;

    const entityLocale = resolveLocale(row, fallbackLocale);

    if (readSoftDeleted(row)) {
      deleteStrapiEntity({ collection, documentId, locale: entityLocale });
      continue;
    }

    upsertStrapiEntity({
      collection,
      documentId,
      locale: entityLocale,
      updatedAtRemote: updatedAt,
      payload: row,
      isDeleted: false,
    });
  }
}

/**
 * Mirrors every lesson-graph REST list currently in the Query cache into SQLite.
 * Intended to run after a successful network refresh so offline reads can migrate off AsyncStorage-only JSON later.
 */
export function persistLessonContentQueryCache(queryClient: QueryClient, locale: string): void {
  const jobs: { collection: StrapiCollection; queryKey: readonly unknown[] }[] = [
    { collection: 'lessons', queryKey: api_keys.lessons(locale) },
    { collection: 'lesson-chapters', queryKey: api_keys.chapters(locale) },
    { collection: 'lesson-videos', queryKey: api_keys.videos(locale) },
    { collection: 'quizzes', queryKey: api_keys.quizzes(locale) },
    { collection: 'qas', queryKey: api_keys.qas(locale) },
    { collection: 'matchings', queryKey: api_keys.matchings(locale) },
    { collection: 'matching-questions', queryKey: api_keys.matchingQuestions(locale) },
    { collection: 'matching-answers', queryKey: api_keys.matchingAnswers(locale) },
  ];

  for (const { collection, queryKey } of jobs) {
    const rows = getLessonContentListFromCache<unknown>(queryClient, queryKey);
    persistRows(rows, collection, locale);
  }

  setLastSyncedAt(new Date().toISOString());
}
