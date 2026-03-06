import type { StrapiLessonMinimal } from '@/types/api';

/**
 * Resolves the playable media URL for a lesson from video or lesson details.
 */
export function getLessonMediaUrl(lesson: StrapiLessonMinimal): string {
  return (
    lesson.video_lesson_details?.video_url ??
    lesson.lesson_details?.video_url ??
    ''
  );
}
