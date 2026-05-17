import type { FileDownloadRow } from '@/db/repository/fileDownloadsRepository';

type DownloadsStateBridge = {
  hydrate: (rows: FileDownloadRow[]) => void;
  upsertRow: (row: FileDownloadRow) => void;
  mergeRow: (id: string, patch: Partial<FileDownloadRow>) => void;
};

let bridge: DownloadsStateBridge | null = null;

export function attachDownloadsStateBridge(next: DownloadsStateBridge): void {
  bridge = next;
}

export const downloadsStateBridge = {
  hydrate(rows: FileDownloadRow[]) {
    bridge?.hydrate(rows);
  },
  upsertRow(row: FileDownloadRow) {
    bridge?.upsertRow(row);
  },
  mergeRow(id: string, patch: Partial<FileDownloadRow>) {
    bridge?.mergeRow(id, patch);
  },
};
