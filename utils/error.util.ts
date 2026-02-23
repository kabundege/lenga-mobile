import { AxiosError } from 'axios';

/**
 * Centralized API error handler. Use in mutation onError.
 * Can be extended to show toast/snackbar when available.
 */
export function handleAxiosError(error: unknown): void {
  if (error instanceof AxiosError) {
    const message =
      (error.response?.data as { error?: { message?: string }; message?: string })?.message ??
      (error.response?.data as { error?: { message?: string } })?.error?.message ??
      error.message;
    __DEV__ && console.warn('[API Error]', message, error.response?.status);
  }
}
