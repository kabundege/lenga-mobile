import { toAbsoluteMediaUrl } from '@/utils/offlineMedia';

export type ChapterVideoPayload = { lesson_video?: { url?: string | null } | null } | null | undefined;

export function getChapterVideoUrl(chapterVideo: ChapterVideoPayload): string {
  const rawUrl = chapterVideo?.lesson_video?.url ?? '';
  return toAbsoluteMediaUrl(rawUrl);
}

