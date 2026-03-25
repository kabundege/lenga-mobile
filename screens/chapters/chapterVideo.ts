import { API_URL } from '@/utils/functions/env';

export type ChapterVideoPayload = { lesson_video?: { url?: string | null } | null } | null | undefined;

export function getChapterVideoUrl(chapterVideo: ChapterVideoPayload): string {
  const rawUrl = chapterVideo?.lesson_video?.url ?? '';
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
  return `${API_URL}${rawUrl}`;
}

