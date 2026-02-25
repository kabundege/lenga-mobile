import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography/textBody';
import { useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/slices/authSlice';
import { globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import type { LogoutModalRef } from '@/utils/types/modals';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import Button from '../buttons/button';
import IconButton from '../buttons/iconButton';
import BaseModal, { BaseModalProps } from './BaseModal';

type LogoutModalProps = Omit<BaseModalProps, 'children'>;

const LogoutModal = forwardRef<LogoutModalRef, LogoutModalProps>(
  function LogoutModal(props, ref) {
    const modalRef = useRef<BottomSheetModal>(null);
    const dispatch = useAppDispatch();
    const { dismiss } = useBottomSheetModal();

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    const handleLogout = () => {
      dismiss();
      dispatch(logout());
      router.replace('/login');
    };

    return (
      <BaseModal ref={modalRef} {...props}>
        <BottomSheetView style={styles.content}>
          <View style={globalStyles.self_end}>
            <IconButton onPress={() => dismiss()} icon="close" iconType="antd" size="sm" backgroundColor={colors.primary_light} style={globalStyles.border_dashed} />
          </View>
          <ThemedText type="subtitle" style={globalStyles.line_height_4xl}>
            Gusohoka
          </ThemedText>
          <TextBody variant="body1" color="tertiary" style={styles.message}>
            Mbese urashaka guhagarika amasomo uguhindura konti urimo gukoresha
          </TextBody>
          <Button type="primary" size="md" label="Emeza" onPress={handleLogout} />
        </BottomSheetView>
      </BaseModal>
    );
  }
);

export default LogoutModal;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: themeToken.paddingLg,
    paddingBottom: themeToken.paddingLg,
    alignItems: 'center',
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
