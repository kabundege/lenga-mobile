import type { QueryClient } from '@tanstack/react-query';

import { api_keys } from '@/hooks/useLessons';

/** Mirrors `lesson` list payloads persisted by TanStack (service `return { data: StrapiListResponse }`). */
export type LessonGraphListPersistShape<T = unknown> = {
  data?: {
    data?: T[];
    meta?: unknown;
  };
};

export function getLessonContentListFromCache<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): T[] {
  const cached = queryClient.getQueryData<LessonGraphListPersistShape<T>>(queryKey);
  return Array.isArray(cached?.data?.data) ? cached.data.data : [];
}

export function lessonRootListCacheIsEmpty(queryClient: QueryClient, locale: string): boolean {
  const key = api_keys.lessons(locale);
  const cached = queryClient.getQueryData<LessonGraphListPersistShape>(key);
  const rows = cached?.data?.data;
  return !Array.isArray(rows) || rows.length === 0;
}
