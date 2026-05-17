import { db } from '@/db/client';
import { fileDownloads } from '@/db/schema';
import type { DownloadStatus } from '@/downloads/downloadTypes';
import { asc, eq } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type FileDownloadRow = InferSelectModel<typeof fileDownloads>;
export type FileDownloadInsert = InferInsertModel<typeof fileDownloads>;

const isoNow = () => new Date().toISOString();

export async function listAllFileDownloads(): Promise<FileDownloadRow[]> {
  return db.select().from(fileDownloads).orderBy(asc(fileDownloads.updatedAt));
}

export async function getFileDownloadById(id: string): Promise<FileDownloadRow | undefined> {
  const rows = await db.select().from(fileDownloads).where(eq(fileDownloads.id, id)).limit(1);
  return rows[0];
}

export async function upsertFileDownload(input: {
  id: string;
  fileUrl: string;
  localPath: string;
  status?: DownloadStatus;
}): Promise<void> {
  const now = isoNow();
  await db
    .insert(fileDownloads)
    .values({
      id: input.id,
      fileUrl: input.fileUrl,
      localPath: input.localPath,
      status: input.status ?? 'pending',
      progressPercent: 0,
      resumeToken: null,
      bytesWritten: 0,
      bytesExpected: null,
      lastError: null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: fileDownloads.id,
      set: {
        fileUrl: input.fileUrl,
        localPath: input.localPath,
        status: input.status ?? 'pending',
        progressPercent: 0,
        resumeToken: null,
        bytesWritten: 0,
        bytesExpected: null,
        lastError: null,
        updatedAt: now,
      },
    });
}

export async function updateFileDownloadProgress(input: {
  id: string;
  progressPercent: number;
  bytesWritten: number;
  bytesExpected: number | null;
}): Promise<void> {
  await db
    .update(fileDownloads)
    .set({
      progressPercent: input.progressPercent,
      bytesWritten: input.bytesWritten,
      bytesExpected: input.bytesExpected,
      updatedAt: isoNow(),
    })
    .where(eq(fileDownloads.id, input.id));
}

export async function updateFileDownloadResumeToken(input: {
  id: string;
  resumeToken: string | null;
}): Promise<void> {
  await db
    .update(fileDownloads)
    .set({
      resumeToken: input.resumeToken,
      updatedAt: isoNow(),
    })
    .where(eq(fileDownloads.id, input.id));
}

export async function updateFileDownloadStatus(input: {
  id: string;
  status: DownloadStatus;
  lastError?: string | null;
}): Promise<void> {
  await db
    .update(fileDownloads)
    .set({
      status: input.status,
      lastError: input.lastError ?? null,
      updatedAt: isoNow(),
    })
    .where(eq(fileDownloads.id, input.id));
}

export async function markFileDownloadCompleted(input: {
  id: string;
  localPath: string;
}): Promise<void> {
  await db
    .update(fileDownloads)
    .set({
      status: 'completed',
      progressPercent: 100,
      resumeToken: null,
      lastError: null,
      localPath: input.localPath,
      updatedAt: isoNow(),
    })
    .where(eq(fileDownloads.id, input.id));
}
