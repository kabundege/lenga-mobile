import * as FileSystem from 'expo-file-system/legacy';

export function fileNameFromUrl(url: string): string {
  try {
    const decodedPath = decodeURIComponent(new URL(url).pathname);
    const last = decodedPath.split('/').pop();
    return last && last.length > 0 ? last : `download_${Date.now()}`;
  } catch {
    return `download_${Date.now()}`;
  }
}

export function defaultLocalPathForDownload(input: { id: string; url: string }): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error('FileSystem.documentDirectory is unavailable');
  }
  const safeBase = base.endsWith('/') ? base : `${base}/`;
  const fileName = fileNameFromUrl(input.url);
  return `${safeBase}downloads/${input.id}/${fileName}`;
}

export function parentDirectoryUri(fileUri: string): string {
  const trimmed = fileUri.replace(/\/+$/, '');
  const idx = trimmed.lastIndexOf('/');
  if (idx <= 0) return trimmed;
  return `${trimmed.slice(0, idx + 1)}`;
}
