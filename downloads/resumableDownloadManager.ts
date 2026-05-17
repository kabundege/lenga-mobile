import {
  getFileDownloadById,
  listAllFileDownloads,
  markFileDownloadCompleted,
  updateFileDownloadProgress,
  updateFileDownloadResumeToken,
  updateFileDownloadStatus,
  upsertFileDownload,
  type FileDownloadRow,
} from '@/db/repository/fileDownloadsRepository';
import { defaultLocalPathForDownload, parentDirectoryUri } from '@/downloads/downloadPaths';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system/legacy';
import { AppState, type AppStateStatus } from 'react-native';

import { downloadsStateBridge } from '@/downloads/downloadsStateBridge';

const PROGRESS_DEBOUNCE_MS = 450;

const downloadOptions: FileSystem.DownloadOptions = {
  sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
};

const activeResumables = new Map<string, FileSystem.DownloadResumable>();
const runningJobs = new Map<string, Promise<void>>();
const progressTimers = new Map<string, ReturnType<typeof setTimeout>>();
const latestProgress = new Map<
  string,
  { totalBytesWritten: number; totalBytesExpectedToWrite: number }
>();

let listenersAttached = false;

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function computePercent(written: number, expected: number): number {
  if (expected > 0) {
    return clampPercent((written / expected) * 100);
  }
  return 0;
}

function normalizeExpectedBytes(expected: number): number | null {
  return expected > 0 ? expected : null;
}

function clearProgressState(downloadId: string): void {
  const timer = progressTimers.get(downloadId);
  if (timer) clearTimeout(timer);
  progressTimers.delete(downloadId);
  latestProgress.delete(downloadId);
}

async function flushProgress(downloadId: string): Promise<void> {
  const snap = latestProgress.get(downloadId);
  if (!snap) return;

  const expected = normalizeExpectedBytes(snap.totalBytesExpectedToWrite);
  const percent = computePercent(snap.totalBytesWritten, snap.totalBytesExpectedToWrite);

  await updateFileDownloadProgress({
    id: downloadId,
    progressPercent: percent,
    bytesWritten: snap.totalBytesWritten,
    bytesExpected: expected,
  });

  downloadsStateBridge.mergeRow(downloadId, {
    progressPercent: percent,
    bytesWritten: snap.totalBytesWritten,
    bytesExpected: expected,
    updatedAt: new Date().toISOString(),
  });
}

function scheduleProgressFlush(downloadId: string): void {
  const existing = progressTimers.get(downloadId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    progressTimers.delete(downloadId);
    void flushProgress(downloadId);
  }, PROGRESS_DEBOUNCE_MS);

  progressTimers.set(downloadId, timer);
}

async function ensureParentDirectory(fileUri: string): Promise<void> {
  const dir = parentDirectoryUri(fileUri);
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown download error';
}

async function syncRowFromDb(downloadId: string): Promise<void> {
  const row = await getFileDownloadById(downloadId);
  if (!row) return;
  downloadsStateBridge.upsertRow(row);
}

async function failDownload(downloadId: string, error: unknown): Promise<void> {
  const message = formatError(error);
  await updateFileDownloadStatus({ id: downloadId, status: 'failed', lastError: message });
  await syncRowFromDb(downloadId);
}

async function executeDownload(downloadId: string): Promise<void> {
  const row = await getFileDownloadById(downloadId);
  if (!row) return;

  if (row.status === 'completed') return;
  if (row.status === 'paused') return;

  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    await updateFileDownloadStatus({
      id: downloadId,
      status: 'pending',
      lastError: 'Device is offline',
    });
    await syncRowFromDb(downloadId);
    return;
  }

  await ensureParentDirectory(row.localPath);

  await updateFileDownloadStatus({ id: downloadId, status: 'downloading', lastError: null });
  await syncRowFromDb(downloadId);

  const resumable = FileSystem.createDownloadResumable(
    row.fileUrl,
    row.localPath,
    downloadOptions,
    (data) => {
      latestProgress.set(downloadId, {
        totalBytesWritten: data.totalBytesWritten,
        totalBytesExpectedToWrite: data.totalBytesExpectedToWrite,
      });
      scheduleProgressFlush(downloadId);
    },
    row.resumeToken ?? undefined,
  );

  activeResumables.set(downloadId, resumable);

  try {
    const result = await resumable.downloadAsync();
    clearProgressState(downloadId);

    if (!result) {
      await updateFileDownloadStatus({
        id: downloadId,
        status: 'paused',
        lastError: null,
      });
      await syncRowFromDb(downloadId);
      return;
    }

    if (result.status < 200 || result.status >= 300) {
      await failDownload(
        downloadId,
        new Error(`HTTP ${result.status} while downloading`),
      );
      return;
    }

    await markFileDownloadCompleted({ id: downloadId, localPath: result.uri });
    await syncRowFromDb(downloadId);
  } catch (error) {
    clearProgressState(downloadId);

    if ((error as { code?: string })?.code === 'ERR_DOWNLOAD_CANCELLED') {
      await syncRowFromDb(downloadId);
      return;
    }

    await failDownload(downloadId, error);
  } finally {
    activeResumables.delete(downloadId);
  }
}

export async function runDownloadJob(downloadId: string): Promise<void> {
  const existing = runningJobs.get(downloadId);
  if (existing) return existing;

  const job = executeDownload(downloadId).finally(() => {
    runningJobs.delete(downloadId);
  });

  runningJobs.set(downloadId, job);
  return job;
}

export async function enqueueNewDownload(input: {
  id: string;
  url: string;
  localPath?: string;
}): Promise<void> {
  const localPath = input.localPath ?? defaultLocalPathForDownload({ id: input.id, url: input.url });

  await upsertFileDownload({
    id: input.id,
    fileUrl: input.url,
    localPath,
    status: 'pending',
  });

  await syncRowFromDb(input.id);
  await runDownloadJob(input.id);
}

export async function pauseDownloadJob(downloadId: string): Promise<void> {
  const resumable = activeResumables.get(downloadId);

  if (!resumable) {
    await updateFileDownloadStatus({ id: downloadId, status: 'paused', lastError: null });
    await syncRowFromDb(downloadId);
    return;
  }

  try {
    const pauseState = await resumable.pauseAsync();
    await updateFileDownloadResumeToken({
      id: downloadId,
      resumeToken: pauseState.resumeData ?? null,
    });
    await updateFileDownloadStatus({ id: downloadId, status: 'paused', lastError: null });
    await syncRowFromDb(downloadId);
  } catch (error) {
    await failDownload(downloadId, error);
  } finally {
    activeResumables.delete(downloadId);
    clearProgressState(downloadId);
  }
}

export async function resumeDownloadJob(downloadId: string): Promise<void> {
  const row = await getFileDownloadById(downloadId);
  if (!row) return;

  if (row.status === 'completed') return;

  await updateFileDownloadStatus({
    id: downloadId,
    status: 'pending',
    lastError: null,
  });
  await syncRowFromDb(downloadId);
  await runDownloadJob(downloadId);
}

/** Loads SQLite rows into Zustand and restarts any downloads that were interrupted. */
export async function bootstrapDownloadsStore(): Promise<void> {
  const rows = await listAllFileDownloads();
  downloadsStateBridge.hydrate(rows);

  ensureLifecycleHooks();

  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  await Promise.all(
    rows
      .filter((row) => row.status === 'downloading' || row.status === 'pending')
      .map((row) => runDownloadJob(row.id)),
  );
}

function ensureLifecycleHooks(): void {
  if (listenersAttached) return;
  listenersAttached = true;

  let lastState: AppStateStatus = AppState.currentState;

  AppState.addEventListener('change', (nextState) => {
    const prev = lastState;
    lastState = nextState;

    if (prev.match(/inactive|background/) && nextState === 'active') {
      void resumeInterruptedDownloadsAfterForeground();
    }
  });
}

async function resumeInterruptedDownloadsAfterForeground(): Promise<void> {
  const rows = await listAllFileDownloads();
  downloadsStateBridge.hydrate(rows);

  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  await Promise.all(
    rows
      .filter((row) => row.status === 'downloading' && !runningJobs.has(row.id))
      .map((row) => runDownloadJob(row.id)),
  );
}

export function getActiveDownloadIds(): string[] {
  return [...activeResumables.keys()];
}
