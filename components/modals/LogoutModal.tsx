import { ThemedText } from "@/components/themed-text";
import { TextBody } from "@/components/typography/textBody";
import { useAppUpdates } from "@/hooks/useAppUpdates";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout } from "@/store/slices/authSlice";
import { selectSavedOfflineMediaEntries } from "@/store/slices/offlineMediaSlice";
import { DATE_FORMAT_WITH_YEAR } from "@/utils/functions/date";
import { globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import type { LogoutModalRef } from "@/utils/types/modals";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetView, useBottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Button from "../buttons/button";
import IconButton from "../buttons/iconButton";
import { TextHeading } from "../typography";
import BaseModal, { BaseModalProps } from "./BaseModal";

export type LogoutModalProps = Omit<BaseModalProps, "children">;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = i === 0 ? 0 : v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(digits)} ${units[i]}`;
}

type VersionDetailRowProps = {
  label: string;
  value: string;
};

function VersionDetailRow({ label, value }: VersionDetailRowProps) {
  return (
    <View style={[globalStyles.flex_row, globalStyles.justify_between, styles.versionRow]}>
      <TextBody variant="body2" color="secondary">
        {label}
      </TextBody>
      <TextBody variant="body2" strong style={styles.versionValue}>
        {value}
      </TextBody>
    </View>
  );
}

const LogoutModal = forwardRef<LogoutModalRef, LogoutModalProps>(
  function LogoutModal(props, ref) {
    const modalRef = useRef<BottomSheetModal>(null);
    const dispatch = useAppDispatch();
    const { dismiss } = useBottomSheetModal();
    const { t } = useTranslation();
    const savedEntries = useAppSelector(selectSavedOfflineMediaEntries);
    const {
      nativeVersion,
      runtimeVersion,
      isEmbeddedLaunch,
      isEmergencyLaunch,
      updateId,
      channel,
      createdAt,
      isUpdateAvailable,
      isUpdatePending,
      isChecking,
      isDownloading,
      isDevBuild,
      isUpdatesEnabled,
      checkForUpdate,
      installUpdate,
    } = useAppUpdates();
    const savedCount = savedEntries.length;
    const totalStorageBytes = useMemo(
      () => savedEntries.reduce((sum, e) => sum + (e.fileSize ?? 0), 0),
      [savedEntries],
    );
    const bundleTypeLabel = isEmbeddedLaunch
      ? t("profile.appVersion.embedded")
      : t("profile.appVersion.otaUpdate");
    const formattedPublishedAt = createdAt
      ? dayjs(createdAt).format(DATE_FORMAT_WITH_YEAR)
      : null;
    const isInstallBusy = isUpdatePending || isDownloading;
    const showInstallButton = isUpdateAvailable || isUpdatePending;

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    const handleLogout = () => {
      dismiss();
      dispatch(logout());
      router.replace("/login");
    };

    return (
      <BaseModal ref={modalRef} {...props}>
        <BottomSheetView style={styles.content}>
          <View style={globalStyles.self_end}>
            <IconButton
              onPress={() => dismiss()}
              icon="close"
              iconType="antd"
              size="sm"
              backgroundColor={colors.primary_light}
              style={globalStyles.border_dashed}
            />
          </View>

          <View
            style={[
              globalStyles.items_center,
              globalStyles.border_b,
              globalStyles.pb_md,
              globalStyles.mb_md,
            ]}
          >
            <ThemedText type="subtitle" style={globalStyles.line_height_4xl}>
              {t("profile.logout.title")}
            </ThemedText>
            <TextBody variant="body1" color="tertiary" style={styles.message}>
              {t("profile.logout.message")}
            </TextBody>
            <Button
              type="primary"
              size="md"
              label={t("profile.logout.confirmButton")}
              onPress={handleLogout}
            />
          </View>

          <View style={styles.storageSection}>
            <View style={[globalStyles.w_full]}>
              <TextHeading variant="subTitle" color="primary">
                {t("profile.offlineStorage.title")}
              </TextHeading>
              <TextBody variant="body2" color="secondary">
                {t("profile.offlineStorage.stats", {
                  count: savedCount,
                  storage: formatBytes(totalStorageBytes),
                })}
              </TextBody>
            </View>
          </View>

          <View style={styles.versionSection}>
            <TextHeading variant="subTitle" color="primary">
              {t("profile.appVersion.title")}
            </TextHeading>

            <VersionDetailRow
              label={t("profile.appVersion.nativeVersion")}
              value={nativeVersion}
            />
            {runtimeVersion ? (
              <VersionDetailRow
                label={t("profile.appVersion.runtimeVersion")}
                value={runtimeVersion}
              />
            ) : null}
            <VersionDetailRow
              label={t("profile.appVersion.bundleType")}
              value={bundleTypeLabel}
            />
            {channel ? (
              <VersionDetailRow
                label={t("profile.appVersion.channel")}
                value={channel}
              />
            ) : null}
            {updateId ? (
              <VersionDetailRow
                label={t("profile.appVersion.updateId")}
                value={updateId}
              />
            ) : null}
            {formattedPublishedAt ? (
              <VersionDetailRow
                label={t("profile.appVersion.publishedAt")}
                value={formattedPublishedAt}
              />
            ) : null}

            {isDevBuild ? (
              <TextBody variant="caption" color="tertiary" style={styles.versionHint}>
                {t("profile.appVersion.devMode")}
              </TextBody>
            ) : null}
            {!isUpdatesEnabled && !isDevBuild ? (
              <TextBody variant="caption" color="tertiary" style={styles.versionHint}>
                {t("profile.appVersion.updatesDisabled")}
              </TextBody>
            ) : null}
            {isEmergencyLaunch ? (
              <TextBody variant="caption" color="tertiary" style={styles.versionHint}>
                {t("profile.appVersion.emergencyLaunch")}
              </TextBody>
            ) : null}
            {isUpdateAvailable ? (
              <TextBody variant="body2" color="primary" style={styles.versionHint}>
                {t("profile.appVersion.updateAvailable")}
              </TextBody>
            ) : null}

            <View style={styles.versionActions}>
              <Button
                type="outlined"
                size="sm"
                isBlock
                loading={isChecking}
                disabled={isInstallBusy}
                label={
                  isChecking
                    ? t("profile.appVersion.checking")
                    : t("profile.appVersion.checkButton")
                }
                onPress={checkForUpdate}
              />
              {showInstallButton ? (
                <Button
                  type="primary"
                  size="sm"
                  isBlock
                  loading={isInstallBusy}
                  disabled={isChecking}
                  label={
                    isInstallBusy
                      ? t("profile.appVersion.installing")
                      : t("profile.appVersion.installButton")
                  }
                  onPress={installUpdate}
                />
              ) : null}
            </View>
          </View>
        </BottomSheetView>
      </BaseModal>
    );
  },
);

export default LogoutModal;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: themeToken.paddingLg,
    paddingHorizontal: themeToken.paddingLg,
  },
  storageSection: {
    width: "100%",
    backgroundColor: colors.primary_light,
    ...globalStyles.rounded_sm,
    ...globalStyles.px_md,
    ...globalStyles.py_xs,
  },
  versionSection: {
    width: "100%",
    marginTop: themeToken.spacingSm,
    backgroundColor: colors.primary_light,
    ...globalStyles.rounded_sm,
    ...globalStyles.px_md,
    ...globalStyles.py_xs,
    ...globalStyles.gap_2xs,
  },
  versionRow: {
    gap: themeToken.spacingSm,
  },
  versionValue: {
    flexShrink: 1,
    textAlign: "right",
  },
  versionHint: {
    marginTop: themeToken.spacingSm,
  },
  versionActions: {
    marginTop: themeToken.spacingSm,
    gap: themeToken.spacingSm,
  },
  title: {
    marginBottom: themeToken.spacingSm,
  },
  message: {
    textAlign: "center",
    marginBottom: themeToken.spacing,
  },
  actions: {
    flexDirection: "row",
    gap: themeToken.spacing,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: themeToken.controlHeight.md * 0.5,
    borderRadius: themeToken.borderRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancel: {
    backgroundColor: colors.background.tertiary,
  },
  buttonLogout: {
    backgroundColor: colors.danger.primary,
  },
  logoutButtonText: {
    color: colors.text.inverted,
  },
});
