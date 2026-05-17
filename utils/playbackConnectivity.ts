/** True when the resolved URI implies streaming over HTTP(S) vs a local/native file URI. */

export function playbackRequiresNetwork(uri: string | undefined | null): boolean {
  if (!uri) return false;
  const trimmed = uri.trim();
  return /^https?:\/\//i.test(trimmed);
}
