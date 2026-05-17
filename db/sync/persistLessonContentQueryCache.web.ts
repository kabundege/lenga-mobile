import type { QueryClient } from '@tanstack/react-query';

/** SQLite cache layer is native-only; web keeps TanStack Query persistence only. */
export function persistLessonContentQueryCache(_queryClient: QueryClient, _locale: string): void {}
