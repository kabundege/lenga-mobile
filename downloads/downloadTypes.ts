export const DOWNLOAD_STATUSES = [
  'pending',
  'downloading',
  'paused',
  'completed',
  'failed',
] as const;

export type DownloadStatus = (typeof DOWNLOAD_STATUSES)[number];

export function isDownloadStatus(value: string): value is DownloadStatus {
  return (DOWNLOAD_STATUSES as readonly string[]).includes(value);
}
