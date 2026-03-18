import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import { File } from 'expo-file-system';
import { fileExists, getOfflinePathForLesson } from '@/utils/offlineMedia';
import type { RootState } from '@/store';

export type OfflineMediaStatus = 'not_saved' | 'saving' | 'saved' | 'error';

export type OfflineMediaEntry = {
  lessonId: string; // Strapi lesson documentId
  remoteUrl: string;
  localUri: string | null;
  status: OfflineMediaStatus;
  bytesWritten: number;
  totalBytes: number | null;
  /** File size in bytes when status is 'saved' (for storage stats). */
  fileSize?: number;
  errorMessage: string | null;
  updatedAt: number;
};

export type OfflineMediaState = {
  byLessonId: Record<string, OfflineMediaEntry | undefined>;
};

const initialState: OfflineMediaState = {
  byLessonId: {},
};

export const downloadLessonMedia = createAsyncThunk<
  { lessonId: string; remoteUrl: string; localUri: string },
  { lessonId: string; remoteUrl: string }
>('offlineMedia/downloadLessonMedia', async ({ lessonId, remoteUrl }, thunkApi) => {
  let progressTimer: ReturnType<typeof setInterval> | null = null;
  try {
    thunkApi.dispatch(startSaving({ lessonId, remoteUrl }));

    const targetUri = getOfflinePathForLesson(lessonId, remoteUrl);

    if (fileExists(targetUri)) {
      const existing = new File(targetUri);
      const fileSize = typeof existing.size === 'number' ? existing.size : undefined;
      thunkApi.dispatch(markSaved({ lessonId, remoteUrl, localUri: targetUri, fileSize }));
      return { lessonId, remoteUrl, localUri: targetUri };
    }

    // Best-effort: try to get total bytes via HEAD for % progress.
    try {
      const head = await fetch(remoteUrl, { method: 'HEAD' });
      const len = head.headers.get('content-length');
      const totalBytes = len ? Number(len) : NaN;
      if (Number.isFinite(totalBytes) && totalBytes > 0) {
        thunkApi.dispatch(
          updateProgress({ lessonId, bytesWritten: 0, totalBytes })
        );
      }
    } catch {
      // ignore
    }

    // Best-effort: while downloading, poll the target file size.
    // On Android the file is streamed into place (size increases). On iOS it may stay 0 until complete.
    progressTimer = setInterval(() => {
      try {
        const size = new File(targetUri).size;
        if (typeof size === 'number' && size >= 0) {
          thunkApi.dispatch(updateProgress({ lessonId, bytesWritten: size }));
        }
      } catch {
        // ignore
      }
    }, 500);

    const downloaded = await File.downloadFileAsync(remoteUrl, new File(targetUri), {
      idempotent: true,
    });
    const localUri = downloaded.uri;
    const fileSize = typeof downloaded.size === 'number' ? downloaded.size : undefined;

    thunkApi.dispatch(markSaved({ lessonId, remoteUrl, localUri, fileSize }));
    return { lessonId, remoteUrl, localUri };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unable to download media.';
    thunkApi.dispatch(markError({ lessonId, message }));
    return thunkApi.rejectWithValue(message);
  } finally {
    if (progressTimer) clearInterval(progressTimer);
  }
});

export const removeSavedLesson = createAsyncThunk<
  { lessonId: string },
  { lessonId: string }
>('offlineMedia/removeSavedLesson', async ({ lessonId }, thunkApi) => {
  const state = thunkApi.getState() as { offlineMedia: OfflineMediaState };
  const entry = state.offlineMedia.byLessonId[lessonId];
  const localUri = entry?.localUri;
  if (localUri) {
    try {
      const file = new File(localUri);
      if (file.exists) file.delete();
    } catch {
      // ignore
    }
  }
  thunkApi.dispatch(markNotSaved({ lessonId }));
  return { lessonId };
});

export const upsertEntry = createAsyncThunk<
  { lessonId: string; remoteUrl: string },
  { lessonId: string; remoteUrl: string }
>('offlineMedia/upsertEntry', async ({ lessonId, remoteUrl }) => {
  return { lessonId, remoteUrl };
});

export const offlineMediaSlice = createSlice({
  name: 'offlineMedia',
  initialState,
  reducers: {
    startSaving: (
      state,
      action: PayloadAction<{ lessonId: string; remoteUrl: string }>
    ) => {
      const { lessonId, remoteUrl } = action.payload;
      const prev = state.byLessonId[lessonId];
      state.byLessonId[lessonId] = {
        lessonId,
        remoteUrl,
        localUri: prev?.localUri ?? null,
        status: 'saving',
        bytesWritten: 0,
        totalBytes: null,
        errorMessage: null,
        updatedAt: Date.now(),
      };
    },
    updateProgress: (
      state,
      action: PayloadAction<{
        lessonId: string;
        bytesWritten: number;
        totalBytes?: number | null;
      }>
    ) => {
      const { lessonId, bytesWritten, totalBytes } = action.payload;
      const entry = state.byLessonId[lessonId];
      if (!entry) return;
      entry.bytesWritten = bytesWritten;
      if (typeof totalBytes !== 'undefined') entry.totalBytes = totalBytes;
      entry.updatedAt = Date.now();
    },
    markSaved: (
      state,
      action: PayloadAction<{
        lessonId: string;
        remoteUrl: string;
        localUri: string;
        fileSize?: number;
      }>
    ) => {
      const { lessonId, remoteUrl, localUri, fileSize } = action.payload;
      state.byLessonId[lessonId] = {
        lessonId,
        remoteUrl,
        localUri,
        status: 'saved',
        bytesWritten: 0,
        totalBytes: null,
        fileSize,
        errorMessage: null,
        updatedAt: Date.now(),
      };
    },
    markError: (
      state,
      action: PayloadAction<{ lessonId: string; message: string }>
    ) => {
      const { lessonId, message } = action.payload;
      const prev = state.byLessonId[lessonId];
      state.byLessonId[lessonId] = {
        lessonId,
        remoteUrl: prev?.remoteUrl ?? '',
        localUri: prev?.localUri ?? null,
        status: 'error',
        bytesWritten: prev?.bytesWritten ?? 0,
        totalBytes: prev?.totalBytes ?? null,
        errorMessage: message,
        updatedAt: Date.now(),
      };
    },
    markNotSaved: (state, action: PayloadAction<{ lessonId: string }>) => {
      const { lessonId } = action.payload;
      delete state.byLessonId[lessonId];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(upsertEntry.fulfilled, (state, action) => {
      const { lessonId, remoteUrl } = action.payload;
      const prev = state.byLessonId[lessonId];
      if (!prev) {
        state.byLessonId[lessonId] = {
          lessonId,
          remoteUrl,
          localUri: null,
          status: 'not_saved',
          bytesWritten: 0,
          totalBytes: null,
          errorMessage: null,
          updatedAt: Date.now(),
        };
        return;
      }
      prev.remoteUrl = remoteUrl;
      prev.updatedAt = Date.now();
    });
  },
});

export const { startSaving, updateProgress, markSaved, markError, markNotSaved } =
  offlineMediaSlice.actions;
export const offlineMediaReducer = offlineMediaSlice.reducer;

export const selectSavedOfflineMediaEntries = createSelector(
  (state: RootState) => state.offlineMedia.byLessonId,
  (byLessonId) =>
    Object.values(byLessonId).filter(
      (e): e is OfflineMediaEntry => e != null && e.status === 'saved'
    )
);

