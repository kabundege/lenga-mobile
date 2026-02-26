import { AxiosError } from 'axios';
import { toast } from 'sonner-native';

/**
 * Extract user-facing message from an Axios error.
 */
export function getAxiosErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { error?: { message?: string }; message?: string })?.message ??
      (error.response?.data as { error?: { message?: string } })?.error?.message ??
      error.message ??
      'Something went wrong'
    );
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

/**
 * Centralized API error handler. Use in mutation onError.
 * Shows a toast and logs in dev.
 */
export function handleAxiosError(error: unknown): void {
  const message = getAxiosErrorMessage(error);
  toast.error(message);
  if (error instanceof AxiosError) {
    __DEV__ && console.warn('[API Error]', message, error.response?.status);
  }
}
