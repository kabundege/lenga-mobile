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
  StrapiMatching,
  StrapiMatchingQuestion,
  StrapiQA,
  StrapiQuiz,
} from '@/types/api';
import {
  collectAllMediaForLesson,
  collectChapterSubtreeMedia,
  collectQuizSubtreeMedia,
} from '@/utils/offlineMediaInventory';
import { ensureOfflineAsset } from '@/utils/offlineMedia';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { QueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { RootState } from '@/store';
import { setAsset, setLessonSync } from './offlineAssetsSlice';

// ─── Cache helpers ────────────────────────────────────────────────────────────

export function getLessonContentListFromCache<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): T[] {
  const cached = queryClient.getQueryData<AxiosResponse<{ data: T[] }>>(queryKey);
  return Array.isArray(cached?.data?.data) ? cached.data.data : [];
}

async function runMediaDownloadsForLesson(
  dispatch: (action: unknown) => unknown,
  lessonId: string,
  mediaUrls: string[],
) {
  if (mediaUrls.length === 0) {
    dispatch(
      setLessonSync({
        lessonId,
        status: 'done',
        totalAssets: 0,
        downloadedAssets: 0,
      }),
    );
    return;
  }

  dispatch(
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
        dispatch(setAsset({ remoteUrl: result.remoteUrl, localUri: result.localUri }));
      }
    } catch {
      // One asset failing must not block the rest.
    }
    downloaded += 1;
    dispatch(
      setLessonSync({
        lessonId,
        status: 'downloading',
        totalAssets: mediaUrls.length,
        downloadedAssets: downloaded,
      }),
    );
  }

  dispatch(
    setLessonSync({
      lessonId,
      status: 'done',
      totalAssets: mediaUrls.length,
      downloadedAssets: mediaUrls.length,
    }),
  );
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
    const lessons = getLessonContentListFromCache<StrapiLesson>(queryClient, [
      'lessons',
      { locale },
    ]);
    const chapters = getLessonContentListFromCache<StrapiLessonChapter>(queryClient, [
      'chapters',
      { locale },
    ]);
    const videos = getLessonContentListFromCache<StrapiLessonVideo>(queryClient, [
      'videos',
      { locale },
    ]);
    const quizzes = getLessonContentListFromCache<StrapiQuiz>(queryClient, ['quizzes', { locale }]);
    const qas = getLessonContentListFromCache<StrapiQA>(queryClient, ['qas', { locale }]);
    const matchings = getLessonContentListFromCache<StrapiMatching>(queryClient, [
      'matchings',
      { locale },
    ]);
    const matchingQuestions = getLessonContentListFromCache<StrapiMatchingQuestion>(queryClient, [
      'matching-questions',
      { locale },
    ]);

    const lesson = lessons.find((l) => l.documentId === lessonId);
    if (!lesson) return { lessonId };

    const mediaUrls = collectAllMediaForLesson(
      lesson,
      chapters,
      videos,
      quizzes,
      qas,
      matchings,
      matchingQuestions,
    );

    await runMediaDownloadsForLesson(thunkApi.dispatch, lessonId, mediaUrls);

    return { lessonId };
  },
);

/**
 * Downloads all media for one chapter (video, quizzes, Q&A, matching) using the parent
 * lesson only for progress bookkeeping in `lessonSyncQueue`.
 */
export const downloadChapterAssets = createAsyncThunk<
  { lessonId: string; chapterDocumentId: string },
  { lessonId: string; chapterDocumentId: string; queryClient: QueryClient; locale: string },
  { state: RootState }
>(
  'offlineContent/downloadChapterAssets',
  async ({ lessonId, chapterDocumentId, queryClient, locale }, thunkApi) => {
    const lessons = getLessonContentListFromCache<StrapiLesson>(queryClient, [
      'lessons',
      { locale },
    ]);
    const lesson = lessons.find((l) => l.documentId === lessonId);
    const chapterIds = new Set((lesson?.lesson_chapters ?? []).map((c) => c.documentId));
    if (!lesson || !chapterIds.has(chapterDocumentId)) {
      return { lessonId, chapterDocumentId };
    }

    const chapters = getLessonContentListFromCache<StrapiLessonChapter>(queryClient, [
      'chapters',
      { locale },
    ]);
    const chapter = chapters.find((c) => c.documentId === chapterDocumentId);
    if (!chapter) return { lessonId, chapterDocumentId };

    const videos = getLessonContentListFromCache<StrapiLessonVideo>(queryClient, [
      'videos',
      { locale },
    ]);
    const video = videos.find(
      (v) => v.lesson_chapter && v.lesson_chapter.documentId === chapter.documentId,
    );
    const quizzes = getLessonContentListFromCache<StrapiQuiz>(queryClient, ['quizzes', { locale }]);
    const qas = getLessonContentListFromCache<StrapiQA>(queryClient, ['qas', { locale }]);
    const matchings = getLessonContentListFromCache<StrapiMatching>(queryClient, [
      'matchings',
      { locale },
    ]);
    const matchingQuestions = getLessonContentListFromCache<StrapiMatchingQuestion>(queryClient, [
      'matching-questions',
      { locale },
    ]);

    const mediaUrls = collectChapterSubtreeMedia(
      chapter,
      video,
      quizzes,
      qas,
      matchings,
      matchingQuestions,
    );

    await runMediaDownloadsForLesson(thunkApi.dispatch, lessonId, mediaUrls);

    return { lessonId, chapterDocumentId };
  },
);

/**
 * Downloads quiz + Q&A media for one quiz; progress is tracked under the parent lesson id.
 */
export const downloadQuizAssets = createAsyncThunk<
  { lessonId: string; quizDocumentId: string },
  { lessonId: string; quizDocumentId: string; queryClient: QueryClient; locale: string },
  { state: RootState }
>(
  'offlineContent/downloadQuizAssets',
  async ({ lessonId, quizDocumentId, queryClient, locale }, thunkApi) => {
    const quizzes = getLessonContentListFromCache<StrapiQuiz>(queryClient, ['quizzes', { locale }]);
    const quiz = quizzes.find((q) => q.documentId === quizDocumentId);
    if (!quiz) return { lessonId, quizDocumentId };

    const qas = getLessonContentListFromCache<StrapiQA>(queryClient, ['qas', { locale }]);
    const mediaUrls = collectQuizSubtreeMedia(quiz, qas);

    await runMediaDownloadsForLesson(thunkApi.dispatch, lessonId, mediaUrls);

    return { lessonId, quizDocumentId };
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
    const lessons = getLessonContentListFromCache<StrapiLesson>(queryClient, [
      'lessons',
      { locale },
    ]);
    const sorted = lessons.slice().sort((a, b) => a.order - b.order);

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
