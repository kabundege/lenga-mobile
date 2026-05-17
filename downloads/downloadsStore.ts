import type { FileDownloadRow } from '@/db/repository/fileDownloadsRepository';
import { attachDownloadsStateBridge } from '@/downloads/downloadsStateBridge';
import {
  bootstrapDownloadsStore,
  enqueueNewDownload,
  pauseDownloadJob,
  resumeDownloadJob,
} from '@/downloads/resumableDownloadManager';
import { create } from 'zustand';

type DownloadsStore = {
  byId: Record<string, FileDownloadRow>;
  hydrate: (rows: FileDownloadRow[]) => void;
  upsertRow: (row: FileDownloadRow) => void;
  mergeRow: (id: string, patch: Partial<FileDownloadRow>) => void;
  startDownload: (input: { id: string; url: string; localPath?: string }) => Promise<void>;
  pauseDownload: (id: string) => Promise<void>;
  resumeDownload: (id: string) => Promise<void>;
  initStore: () => Promise<void>;
};

export const useDownloadsStore = create<DownloadsStore>((set) => ({
  byId: {},
  hydrate: (rows) => {
    set({ byId: Object.fromEntries(rows.map((row) => [row.id, row])) });
  },
  upsertRow: (row) => {
    set((state) => ({ byId: { ...state.byId, [row.id]: row } }));
  },
  mergeRow: (id, patch) => {
    set((state) => {
      const prev = state.byId[id];
      if (!prev) return state;
      return { byId: { ...state.byId, [id]: { ...prev, ...patch } } };
    });
  },
  startDownload: async (input) => {
    await enqueueNewDownload(input);
  },
  pauseDownload: async (id) => {
    await pauseDownloadJob(id);
  },
  resumeDownload: async (id) => {
    await resumeDownloadJob(id);
  },
  initStore: async () => {
    await bootstrapDownloadsStore();
  },
}));

attachDownloadsStateBridge({
  hydrate: (rows) => useDownloadsStore.getState().hydrate(rows),
  upsertRow: (row) => useDownloadsStore.getState().upsertRow(row),
  mergeRow: (id, patch) => useDownloadsStore.getState().mergeRow(id, patch),
});
