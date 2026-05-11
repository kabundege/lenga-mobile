import { AxiosError } from 'axios';
import { toast } from 'sonner-native';

import i18n from '@/translations/i18n';

const genericErrorMessage = () => i18n.t('global.errors.generic');

/**
 * Extract user-facing message from an Axios error.
 */
export function getAxiosErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { error?: { message?: string }; message?: string })?.message ??
      (error.response?.data as { error?: { message?: string } })?.error?.message ??
      error.message ??
      genericErrorMessage()
    );
  }
  return error instanceof Error ? error.message : genericErrorMessage();
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
