import type { QueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

/** Reads `{ data: { data: T[] } }` lesson-graph list payloads from the TanStack Query cache. */
export function getLessonContentListFromCache<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): T[] {
  const cached = queryClient.getQueryData<AxiosResponse<{ data: T[] }>>(queryKey);
  return Array.isArray(cached?.data?.data) ? cached.data.data : [];
}
