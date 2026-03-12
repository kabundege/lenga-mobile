import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography/textBody';
import { useLanguageSwitch } from '@/hooks/useLanguageSwitch';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logout } from '@/store/slices/authSlice';
import type { OfflineMediaEntry } from '@/store/slices/offlineMediaSlice';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import type { LogoutModalRef } from '@/utils/types/modals';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import Button from '../buttons/button';
import IconButton from '../buttons/iconButton';
import { TextHeading } from '../typography';
import BaseModal, { BaseModalProps } from './BaseModal';

export type LogoutModalProps = Omit<BaseModalProps, 'children'>;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = i === 0 ? 0 : v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(digits)} ${units[i]}`;
}

const LogoutModal = forwardRef<LogoutModalRef, LogoutModalProps>(
  function LogoutModal(props, ref) {
    const modalRef = useRef<BottomSheetModal>(null);
    const dispatch = useAppDispatch();
    const { dismiss } = useBottomSheetModal();
    const { t, currentLanguage, setLanguage } = useLanguageSwitch();
    const savedEntries = useAppSelector((s) =>
      Object.values(s.offlineMedia.byLessonId).filter(
        (e): e is OfflineMediaEntry => e != null && e.status === 'saved'
      )
    );
    const savedCount = savedEntries.length;
    const totalStorageBytes = useMemo(
      () => savedEntries.reduce((sum, e) => sum + (e.fileSize ?? 0), 0),
      [savedEntries]
    );

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    const handleLogout = () => {
      dismiss();
      dispatch(logout());
      router.replace('/login');
    };

    const handleToggleLanguage = () => {
      setLanguage(currentLanguage === 'en' ? 'rw' : 'en');
      dismiss();
    };

    const isEnglish = useMemo(() => currentLanguage === 'en', [currentLanguage]);

    return (
      <BaseModal ref={modalRef} {...props}>
        <BottomSheetView style={styles.content}>
          <View style={globalStyles.self_end}>
            <IconButton onPress={() => dismiss()} icon="close" iconType="antd" size="sm" backgroundColor={colors.primary_light} style={globalStyles.border_dashed} />
          </View>

          <View style={globalStyles.items_center}>
            <ThemedText type="subtitle" style={globalStyles.line_height_4xl}>
              {t('profile.logout.title')}
            </ThemedText>
            <TextBody variant="body1" color="tertiary" style={styles.message}>
              {t('profile.logout.message')}
            </TextBody>
            <Button type="primary" size="md" label={t('profile.logout.confirmButton')} onPress={handleLogout} />
          </View>




          <View style={styles.languageSection}>
            <View style={[flexBetween, globalStyles.w_full]}>
              <View>
                <TextHeading variant="subTitle" color='primary'>
                  {
                    t('global.language.hint')
                  }
                </TextHeading>
                <TextBody variant="body2" color="secondary" style={styles.languageLabel}>
                  {t('global.language.label')}
                </TextBody>
              </View>
              <Switch value={isEnglish} onValueChange={handleToggleLanguage} trackColor={{ true: colors.primary, false: colors.background.secondary }} thumbColor={colors.text.inverted} />
            </View>
            <View style={[globalStyles.w_full, globalStyles.border_t, globalStyles.pt_sm]}>
              <TextHeading variant="subTitle" color="primary">
                {t('profile.offlineStorage.title')}
              </TextHeading>
              <TextBody variant="body2" color="secondary">
                {t('profile.offlineStorage.stats', {
                  count: savedCount,
                  storage: formatBytes(totalStorageBytes),
                })}
              </TextBody>
            </View>
          </View>

        </BottomSheetView>
      </BaseModal>
    );
  }
);

export default LogoutModal;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: themeToken.paddingLg,
    paddingHorizontal: themeToken.paddingLg,
  },
  languageSection: {
    width: '100%',
    marginVertical: themeToken.spacingLg,
    backgroundColor: colors.primary_light,
    ...globalStyles.rounded_sm,
    ...globalStyles.px_md,
    ...globalStyles.py_xs,
  },
  languageLabel: {
    marginBottom: themeToken.spacingSm,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: themeToken.spacingSm,
  },
  languageOption: {
    paddingVertical: themeToken.spacingSm,
    paddingHorizontal: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.tertiary,
  },
  languageOptionActive: {
    backgroundColor: colors.primary,
  },
  iconWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: colors.danger.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: themeToken.spacing,
  },
  title: {
    marginBottom: themeToken.spacingSm,
  },
  message: {
    textAlign: 'center',
    marginBottom: themeToken.spacingLg,
  },
  actions: {
    flexDirection: 'row',
    gap: themeToken.spacing,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: themeToken.controlHeight.md * 0.5,
    borderRadius: themeToken.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
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
