import * as lessonsService from '@/services/lessons.service';
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
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { File } from 'expo-file-system';
import type { RootState } from '@/store';

export type LessonSyncStatus = 'queued' | 'downloading' | 'done' | 'error';

export type LessonSyncEntry = {
  lessonId: string;
  status: LessonSyncStatus;
  totalAssets: number;
  downloadedAssets: number;
  errorMessage?: string;
};

export type OfflineContentState = {
  lessons: StrapiLesson[];
  chapters: StrapiLessonChapter[];
  videos: StrapiLessonVideo[];
  quizzes: StrapiQuiz[];
  qas: StrapiQA[];
  assetByRemoteUrl: Record<string, string>;
  /** Per-lesson download queue status */
  lessonSyncQueue: Record<string, LessonSyncEntry>;
  /** Overall fetch status for the API data (not media) */
  dataFetchStatus: 'idle' | 'fetching' | 'fetched' | 'error';
  lastSyncedAt: number | null;
  errorMessage: string | null;
};

const initialState: OfflineContentState = {
  lessons: [],
  chapters: [],
  videos: [],
  quizzes: [],
  qas: [],
  assetByRemoteUrl: {},
  lessonSyncQueue: {},
  dataFetchStatus: 'idle',
  lastSyncedAt: null,
  errorMessage: null,
};

function getListFromResponse<T>(response?: { data?: { data?: T[] } }) {
  return Array.isArray(response?.data?.data) ? response.data.data : [];
}

function collectMediaUrlsForLesson(
  lesson: StrapiLesson,
  chapters: StrapiLessonChapter[],
  videos: StrapiLessonVideo[],
  quizzes: StrapiQuiz[],
  qas: StrapiQA[],
) {
  const bag = new Set<string>();
  const push = (url?: string | null) => {
    const absolute = toAbsoluteMediaUrl(url);
    if (absolute) bag.add(absolute);
  };

  push(lesson.thumbnail?.url);
  push(lesson.audio_desc?.url);

  const lessonChapterIds = new Set(
    (lesson.lesson_chapters ?? []).map((c) => c.documentId),
  );

  const relatedChapters = chapters.filter((c) => lessonChapterIds.has(c.documentId));
  relatedChapters.forEach((chapter) => {
    push(chapter.thumbnail?.url);
    push(chapter.audio_desc?.url);
  });

  const relatedVideos = videos.filter(
    (v) => v.lesson_chapter && lessonChapterIds.has(v.lesson_chapter.documentId),
  );
  relatedVideos.forEach((video) => {
    push(video.lesson_video?.url);
  });

  const relatedQuizzes = quizzes.filter(
    (q) => q.lesson_chapter && lessonChapterIds.has(q.lesson_chapter.documentId),
  );
  const relatedQuizIds = new Set(relatedQuizzes.map((q) => q.documentId));
  relatedQuizzes.forEach((quiz) => {
    push(quiz.audio_desc?.url);
  });

  const relatedQAs = qas.filter(
    (qa) => qa.quiz && relatedQuizIds.has(qa.quiz.documentId),
  );
  relatedQAs.forEach((qa) => {
    push(qa.thumbnail?.url);
    push(qa.audio_desc?.url);
  });

  return Array.from(bag);
}

async function ensureOfflineAsset(remoteUrl: string) {
  const absolute = toAbsoluteMediaUrl(remoteUrl);
  if (!absolute) return null;
  const targetUri = getOfflinePathForRemoteUrl(absolute);
  if (fileExists(targetUri)) {
    return { remoteUrl: absolute, localUri: targetUri };
  }
  const downloaded = await File.downloadFileAsync(absolute, new File(targetUri), {
    idempotent: true,
  });
  return { remoteUrl: absolute, localUri: downloaded.uri };
}

/**
 * Step 1 -- Fetch all API data and persist it. Does NOT download media.
 * This runs fast so the user can immediately see lesson data offline.
 */
export const fetchOfflineData = createAsyncThunk<
  {
    lessons: StrapiLesson[];
    chapters: StrapiLessonChapter[];
    videos: StrapiLessonVideo[];
    quizzes: StrapiQuiz[];
    qas: StrapiQA[];
  },
  { locale: string }
>('offlineContent/fetchOfflineData', async ({ locale }) => {
  const [lessonsRes, chaptersRes, videosRes, quizzesRes, qasRes] = await Promise.all([
    lessonsService.getLessonsList(locale),
    lessonsService.getChaptersList(locale),
    lessonsService.getVideosList(locale),
    lessonsService.getQuizzesList(locale),
    lessonsService.getQAsList(locale),
  ]);

  return {
    lessons: getListFromResponse<StrapiLesson>(lessonsRes),
    chapters: getListFromResponse<StrapiLessonChapter>(chaptersRes),
    videos: getListFromResponse<StrapiLessonVideo>(videosRes),
    quizzes: getListFromResponse<StrapiQuiz>(quizzesRes),
    qas: getListFromResponse<StrapiQA>(qasRes),
  };
});

/**
 * Step 2 -- Download all media for a single lesson (its chapters, videos,
 * quizzes, QAs). Dispatched once per lesson in a serial queue.
 */
export const downloadLessonAssets = createAsyncThunk<
  { lessonId: string; downloaded: Record<string, string> },
  { lessonId: string },
  { state: RootState }
>('offlineContent/downloadLessonAssets', async ({ lessonId }, thunkApi) => {
  const state = thunkApi.getState();
  const { lessons, chapters, videos, quizzes, qas } = state.offlineContent;

  const lesson = lessons.find((l) => l.documentId === lessonId);
  if (!lesson) return { lessonId, downloaded: {} };

  const mediaUrls = collectMediaUrlsForLesson(lesson, chapters, videos, quizzes, qas);

  thunkApi.dispatch(
    updateLessonSync({
      lessonId,
      status: 'downloading',
      totalAssets: mediaUrls.length,
      downloadedAssets: 0,
    }),
  );

  const downloaded: Record<string, string> = {};
  let count = 0;

  for (const url of mediaUrls) {
    try {
      const result = await ensureOfflineAsset(url);
      if (result) {
        downloaded[result.remoteUrl] = result.localUri;
        thunkApi.dispatch(
          setOfflineAsset({ remoteUrl: result.remoteUrl, localUri: result.localUri }),
        );
      }
    } catch {
      // One asset failing shouldn't block the rest.
    }
    count += 1;
    thunkApi.dispatch(
      updateLessonSync({
        lessonId,
        status: 'downloading',
        totalAssets: mediaUrls.length,
        downloadedAssets: count,
      }),
    );
  }

  thunkApi.dispatch(
    updateLessonSync({
      lessonId,
      status: 'done',
      totalAssets: mediaUrls.length,
      downloadedAssets: mediaUrls.length,
    }),
  );

  return { lessonId, downloaded };
});

/**
 * Master thunk -- fetches data, then queues per-lesson media downloads
 * sequentially (one lesson at a time).
 */
export const syncOfflineLearningContent = createAsyncThunk<
  void,
  { locale: string },
  { state: RootState }
>('offlineContent/syncOfflineLearningContent', async ({ locale }, thunkApi) => {
  const dataResult = await thunkApi.dispatch(fetchOfflineData({ locale })).unwrap();
  const sortedLessons = dataResult.lessons.slice().sort((a, b) => a.order - b.order);

  for (const lesson of sortedLessons) {
    thunkApi.dispatch(
      updateLessonSync({
        lessonId: lesson.documentId,
        status: 'queued',
        totalAssets: 0,
        downloadedAssets: 0,
      }),
    );
  }

  for (const lesson of sortedLessons) {
    try {
      await thunkApi.dispatch(downloadLessonAssets({ lessonId: lesson.documentId })).unwrap();
    } catch {
      thunkApi.dispatch(
        updateLessonSync({
          lessonId: lesson.documentId,
          status: 'error',
          totalAssets: 0,
          downloadedAssets: 0,
          errorMessage: 'Download failed',
        }),
      );
    }
  }
});

const offlineContentSlice = createSlice({
  name: 'offlineContent',
  initialState,
  reducers: {
    setOfflineAsset: (
      state,
      action: PayloadAction<{ remoteUrl: string; localUri: string }>,
    ) => {
      const remoteUrl = toAbsoluteMediaUrl(action.payload.remoteUrl);
      if (!remoteUrl) return;
      state.assetByRemoteUrl[remoteUrl] = action.payload.localUri;
    },
    updateLessonSync: (state, action: PayloadAction<LessonSyncEntry>) => {
      state.lessonSyncQueue[action.payload.lessonId] = action.payload;
    },
    clearSyncQueue: (state) => {
      state.lessonSyncQueue = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfflineData.pending, (state) => {
        state.dataFetchStatus = 'fetching';
        state.errorMessage = null;
      })
      .addCase(fetchOfflineData.fulfilled, (state, action) => {
        state.lessons = action.payload.lessons;
        state.chapters = action.payload.chapters;
        state.videos = action.payload.videos;
        state.quizzes = action.payload.quizzes;
        state.qas = action.payload.qas;
        state.dataFetchStatus = 'fetched';
        state.lastSyncedAt = Date.now();
      })
      .addCase(fetchOfflineData.rejected, (state, action) => {
        state.dataFetchStatus = 'error';
        state.errorMessage = action.error.message ?? 'Unable to fetch learning data.';
      });
  },
});

export const { setOfflineAsset, updateLessonSync, clearSyncQueue } =
  offlineContentSlice.actions;
export const offlineContentReducer = offlineContentSlice.reducer;

const selectorCache: Record<string, ReturnType<typeof createSelector>> = {};

export const selectLessonSyncEntry = (lessonId: string) => {
  if (!selectorCache[lessonId]) {
    selectorCache[lessonId] = createSelector(
      (state: RootState) => state.offlineContent.lessonSyncQueue,
      (queue) => queue[lessonId] as LessonSyncEntry | undefined,
    );
  }
  return selectorCache[lessonId] as (state: RootState) => LessonSyncEntry | undefined;
};

export const selectIsAnySyncing = createSelector(
  (state: RootState) => state.offlineContent.lessonSyncQueue,
  (queue) => Object.values(queue).some((e) => e.status === 'downloading' || e.status === 'queued'),
);
