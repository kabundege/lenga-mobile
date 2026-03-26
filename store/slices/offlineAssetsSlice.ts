import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { toAbsoluteMediaUrl } from '@/utils/offlineMedia';

export type LessonSyncStatus = 'queued' | 'downloading' | 'done' | 'error';

export type LessonSyncEntry = {
  lessonId: string;
  status: LessonSyncStatus;
  totalAssets: number;
  downloadedAssets: number;
  errorMessage?: string;
};

export type OfflineAssetsState = {
  /** remoteUrl (absolute) -> local file URI */
  byRemoteUrl: Record<string, string>;
  /** Per-lesson media download progress */
  lessonSyncQueue: Record<string, LessonSyncEntry>;
};

const initialState: OfflineAssetsState = {
  byRemoteUrl: {},
  lessonSyncQueue: {},
};

const offlineAssetsSlice = createSlice({
  name: 'offlineAssets',
  initialState,
  reducers: {
    setAsset: (
      state,
      action: PayloadAction<{ remoteUrl: string; localUri: string }>,
    ) => {
      const key = toAbsoluteMediaUrl(action.payload.remoteUrl);
      if (!key) return;
      state.byRemoteUrl[key] = action.payload.localUri;
    },
    setLessonSync: (state, action: PayloadAction<LessonSyncEntry>) => {
      state.lessonSyncQueue[action.payload.lessonId] = action.payload;
    },
    clearSyncQueue: (state) => {
      state.lessonSyncQueue = {};
    },
  },
});

export const { setAsset, setLessonSync, clearSyncQueue } = offlineAssetsSlice.actions;
export const offlineAssetsReducer = offlineAssetsSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

// Memoised per-lesson selector factory — one selector instance per lessonId.
const lessonSyncSelectorCache = new Map<
  string,
  (state: RootState) => LessonSyncEntry | undefined
>();

export const selectLessonSyncEntry = (lessonId: string) => {
  if (!lessonSyncSelectorCache.has(lessonId)) {
    lessonSyncSelectorCache.set(
      lessonId,
      createSelector(
        (state: RootState) => state.offlineAssets.lessonSyncQueue,
        (queue) => queue[lessonId],
      ),
    );
  }
  return lessonSyncSelectorCache.get(lessonId)!;
};

export const selectIsAnySyncing = createSelector(
  (state: RootState) => state.offlineAssets.lessonSyncQueue,
  (queue) =>
    Object.values(queue).some(
      (e) => e.status === 'downloading' || e.status === 'queued',
    ),
);
