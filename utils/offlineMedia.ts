import { Directory, File, Paths } from 'expo-file-system';

export function getOfflineDir() {
  return new Directory(Paths.document, 'offline-media');
}

export function ensureOfflineDir() {
  const dir = getOfflineDir();
  dir.create({ intermediates: true, idempotent: true });
  return dir;
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

