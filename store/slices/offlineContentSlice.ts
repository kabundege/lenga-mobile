/**
 * offlineContentSlice
 *
 * Responsible ONLY for orchestrating media-file downloads.
 * API data (lessons, chapters, etc.) is owned entirely by TanStack Query.
 * This slice reads that cached data via a QueryClient reference passed into
 * the thunks, then downloads the discovered media URLs to disk and records
 * each local URI in offlineAssetsSlice.
 */

import type {
  StrapiLesson,
  StrapiLessonChapter,
  StrapiLessonVideo,
  StrapiQA,
  StrapiQuiz,
} from '@/types/api';
import {
  fileExists,
  getOfflinePathForRemoteUrl,
  toAbsoluteMediaUrl,
} from '@/utils/offlineMedia';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { File } from 'expo-file-system';
import type { QueryClient } from '@tanstack/react-query';
import type { RootState } from '@/store';
import { setAsset, setLessonSync } from './offlineAssetsSlice';
import type { AxiosResponse } from 'axios';

// ─── Cache helpers ────────────────────────────────────────────────────────────

function getListFromCache<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): T[] {
  const cached = queryClient.getQueryData<AxiosResponse<{ data: T[] }>>(queryKey);
  return Array.isArray(cached?.data?.data) ? cached.data.data : [];
}

// ─── Per-level media collectors ───────────────────────────────────────────────

function push(bag: Set<string>, url?: string | null) {
  const abs = toAbsoluteMediaUrl(url);
  if (abs) bag.add(abs);
}

/** Media that belongs directly to a lesson (thumbnail, audio description). */
function collectLessonMedia(lesson: StrapiLesson, bag: Set<string>) {
  push(bag, lesson.thumbnail?.url);
  push(bag, lesson.audio_desc?.url);
}

/** Media that belongs to a single chapter (thumbnail, audio description, video). */
function collectChapterMedia(
  chapter: StrapiLessonChapter,
  video: StrapiLessonVideo | undefined,
  bag: Set<string>,
) {
  push(bag, chapter.thumbnail?.url);
  push(bag, chapter.audio_desc?.url);
  if (video) push(bag, video.lesson_video?.url);
}

/** Media that belongs to a single quiz (audio description). */
function collectQuizMedia(quiz: StrapiQuiz, bag: Set<string>) {
  push(bag, quiz.audio_desc?.url);
}

/** Media that belongs to a single Q&A (thumbnail, audio description). */
function collectQAMedia(qa: StrapiQA, bag: Set<string>) {
  push(bag, qa.thumbnail?.url);
  push(bag, qa.audio_desc?.url);
}

/**
 * Walks the full lesson tree (lesson → chapters → videos → quizzes → QAs)
 * and returns every unique absolute media URL that needs to be downloaded.
 */
function collectAllMediaForLesson(
  lesson: StrapiLesson,
  chapters: StrapiLessonChapter[],
  videos: StrapiLessonVideo[],
  quizzes: StrapiQuiz[],
  qas: StrapiQA[],
): string[] {
  const bag = new Set<string>();

  // Lesson-level media
  collectLessonMedia(lesson, bag);

  const chapterIds = new Set((lesson.lesson_chapters ?? []).map((c) => c.documentId));

  // Chapter-level media (thumbnail + audio + video)
  chapters
    .filter((c) => chapterIds.has(c.documentId))
    .forEach((chapter) => {
      const video = videos.find(
        (v) => v.lesson_chapter && v.lesson_chapter.documentId === chapter.documentId,
      );
      collectChapterMedia(chapter, video, bag);

      // Quiz-level media under this chapter
      const chapterQuizzes = quizzes.filter(
        (q) => q.lesson_chapter && q.lesson_chapter.documentId === chapter.documentId,
      );
      const quizIds = new Set(chapterQuizzes.map((q) => q.documentId));
      chapterQuizzes.forEach((quiz) => collectQuizMedia(quiz, bag));

      // QA-level media under each quiz
      qas
        .filter((qa) => qa.quiz && quizIds.has(qa.quiz.documentId))
        .forEach((qa) => collectQAMedia(qa, bag));
    });

  return Array.from(bag);
}

// ─── Download helper ──────────────────────────────────────────────────────────

async function ensureOfflineAsset(
  remoteUrl: string,
): Promise<{ remoteUrl: string; localUri: string } | null> {
  const abs = toAbsoluteMediaUrl(remoteUrl);
  if (!abs) return null;
  const targetUri = getOfflinePathForRemoteUrl(abs);
  if (fileExists(targetUri)) return { remoteUrl: abs, localUri: targetUri };
  const result = await File.downloadFileAsync(abs, new File(targetUri), {
    idempotent: true,
  });
  return { remoteUrl: abs, localUri: result.uri };
}

// ─── Thunks ──────────────────────────────────────────────────────────────────

/**
 * Downloads all media assets for a single lesson.
 * Reads chapter / video / quiz / QA data directly from the TanStack Query
 * cache via the `queryClient` argument so we never duplicate API state in Redux.
 */
export const downloadLessonAssets = createAsyncThunk<
  { lessonId: string },
  { lessonId: string; queryClient: QueryClient; locale: string },
  { state: RootState }
>(
  'offlineContent/downloadLessonAssets',
  async ({ lessonId, queryClient, locale }, thunkApi) => {
    const lessons = getListFromCache<StrapiLesson>(queryClient, ['lessons', { locale }]);
    const chapters = getListFromCache<StrapiLessonChapter>(queryClient, ['chapters', { locale }]);
    const videos = getListFromCache<StrapiLessonVideo>(queryClient, ['videos', { locale }]);
    const quizzes = getListFromCache<StrapiQuiz>(queryClient, ['quizzes', { locale }]);
    const qas = getListFromCache<StrapiQA>(queryClient, ['qas', { locale }]);

    const lesson = lessons.find((l) => l.documentId === lessonId);
    if (!lesson) return { lessonId };

    const mediaUrls = collectAllMediaForLesson(lesson, chapters, videos, quizzes, qas);

    thunkApi.dispatch(
      setLessonSync({
        lessonId,
        status: 'downloading',
        totalAssets: mediaUrls.length,
        downloadedAssets: 0,
      }),
    );

    let downloaded = 0;
    for (const url of mediaUrls) {
      try {
        const result = await ensureOfflineAsset(url);
        if (result) {
          thunkApi.dispatch(
            setAsset({ remoteUrl: result.remoteUrl, localUri: result.localUri }),
          );
        }
      } catch {
        // One asset failing must not block the rest.
      }
      downloaded += 1;
      thunkApi.dispatch(
        setLessonSync({
          lessonId,
          status: 'downloading',
          totalAssets: mediaUrls.length,
          downloadedAssets: downloaded,
        }),
      );
    }

    thunkApi.dispatch(
      setLessonSync({
        lessonId,
        status: 'done',
        totalAssets: mediaUrls.length,
        downloadedAssets: mediaUrls.length,
      }),
    );

    return { lessonId };
  },
);

/**
 * Master thunk — queues every lesson and downloads their assets one at a time.
 * Expects all API data to already be in the QueryClient cache.
 */
export const syncLessonMediaAssets = createAsyncThunk<
  void,
  { queryClient: QueryClient; locale: string },
  { state: RootState }
>(
  'offlineContent/syncLessonMediaAssets',
  async ({ queryClient, locale }, thunkApi) => {
    const lessons = getListFromCache<StrapiLesson>(queryClient, ['lessons', { locale }]);
    const sorted = lessons.slice().sort((a, b) => a.order - b.order);

    // Mark all as queued first so cards show the indicator immediately.
    sorted.forEach((lesson) =>
      thunkApi.dispatch(
        setLessonSync({
          lessonId: lesson.documentId,
          status: 'queued',
          totalAssets: 0,
          downloadedAssets: 0,
        }),
      ),
    );

    for (const lesson of sorted) {
      try {
        await thunkApi
          .dispatch(
            downloadLessonAssets({
              lessonId: lesson.documentId,
              queryClient,
              locale,
            }),
          )
          .unwrap();
      } catch {
        thunkApi.dispatch(
          setLessonSync({
            lessonId: lesson.documentId,
            status: 'error',
            totalAssets: 0,
            downloadedAssets: 0,
            errorMessage: 'Download failed',
          }),
        );
      }
    }
  },
);
