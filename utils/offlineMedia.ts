import { Directory, File, Paths } from 'expo-file-system';
import { API_URL } from '@/utils/functions/env';

export function getOfflineDir() {
  return new Directory(Paths.document, 'offline-media');
}

export function ensureOfflineDir() {
  const dir = getOfflineDir();
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Removes all files under offline-media and recreates the directory (sync + per-lesson downloads). */
export function clearOfflineMediaDirectory() {
  const dir = getOfflineDir();
  if (dir.exists) {
    dir.delete();
  }
  ensureOfflineDir();
}

export function guessExtensionFromUrl(url: string) {
  const clean = url.split('?')[0] ?? '';
  const last = clean.split('/').pop() ?? '';
  const dot = last.lastIndexOf('.');
  if (dot === -1) return '';
  const ext = last.slice(dot);
  if (!/^\.[a-z0-9]{1,6}$/i.test(ext)) return '';
  return ext.toLowerCase();
}

export function getOfflinePathForLesson(lessonId: string, remoteUrl: string) {
  const ext = guessExtensionFromUrl(remoteUrl);
  const safeId = lessonId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = ensureOfflineDir();
  const file = new File(dir, `${safeId}${ext}`);
  return file.uri;
}

export function fileExists(uri: string) {
  return new File(uri).exists;
}

export function toAbsoluteMediaUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function getOfflinePathForRemoteUrl(remoteUrl: string) {
  const absoluteUrl = toAbsoluteMediaUrl(remoteUrl);
  const ext = guessExtensionFromUrl(absoluteUrl);
  const safeName = `asset_${hashString(absoluteUrl)}${ext}`;
  const dir = ensureOfflineDir();
  return new File(dir, safeName).uri;
}

/** Download a remote asset into the hashed offline path; skips if already on disk. */
export async function ensureOfflineAsset(
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

