import i18n from '@/translations/i18n';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner-native';

function formatShortUpdateId(updateId: string | null | undefined) {
  if (!updateId) return null;
  return updateId.slice(0, 8);
}

export function useAppUpdates() {
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
  } = Updates.useUpdates();

  const nativeVersion = Constants.expoConfig?.version ?? '—';
  const isUpdatesEnabled = Updates.isEnabled;
  const isDevBuild = __DEV__ || !isUpdatesEnabled;

  useEffect(() => {
    if (isUpdatePending) {
      void Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  const checkForUpdate = useCallback(async () => {
    if (isDevBuild) {
      toast.info(i18n.t('profile.appVersion.devMode'));
      return;
    }

    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        toast.success(i18n.t('profile.appVersion.updateAvailable'));
        return;
      }

      toast.success(i18n.t('profile.appVersion.upToDate'));
    } catch {
      toast.error(i18n.t('profile.appVersion.checkFailed'));
    }
  }, [isDevBuild]);

  const installUpdate = useCallback(async () => {
    if (isDevBuild) return;

    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch {
      toast.error(i18n.t('profile.appVersion.installFailed'));
    }
  }, [isDevBuild]);

  return {
    nativeVersion,
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    isUpdatesEnabled,
    isDevBuild,
    runtimeVersion:
      currentlyRunning.runtimeVersion ?? Updates.runtimeVersion ?? null,
    isEmbeddedLaunch: currentlyRunning.isEmbeddedLaunch,
    isEmergencyLaunch: currentlyRunning.isEmergencyLaunch,
    updateId: formatShortUpdateId(
      currentlyRunning.updateId ?? Updates.updateId,
    ),
    channel: currentlyRunning.channel ?? Updates.channel ?? null,
    createdAt: currentlyRunning.createdAt ?? Updates.createdAt ?? null,
    checkForUpdate,
    installUpdate,
  };
}
