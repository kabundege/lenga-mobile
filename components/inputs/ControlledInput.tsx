import { TextBody } from '@/components/typography/textBody';
import { BUTTON_HIT_SLOP } from '@/utils/constants';
import { Dimensions, flexBetween } from '@/utils/styles';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import Antd_Icons from '@expo/vector-icons/AntDesign';
import FR_Icons from '@expo/vector-icons/Feather';
import MT_Icons from '@expo/vector-icons/MaterialCommunityIcons';
import { PressableScale } from 'pressto';
import React, { useMemo, useState } from 'react';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  useController,
} from 'react-hook-form';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import IconButton from '../buttons/iconButton';
import { ShakeErrorWrapper } from '../ui/shakeErrorWrapper';

export type IconName = keyof typeof MT_Icons.glyphMap | keyof typeof Antd_Icons.glyphMap | keyof typeof FR_Icons.glyphMap;
export type IconType = 'material' | 'antd' | 'feather';

type ControlledInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  containerStyle?: ViewStyle;
  errorMessage?: string;
  icon?: IconName;
  iconType?: IconType;
  isClearable?: boolean;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  containerStyle,
  errorMessage,
  secureTextEntry,
  icon,
  isClearable = false,
  iconType = 'material',
  ...inputProps
}: ControlledInputProps<T>) {
  const [securedTextEntry, setSecuredTextEntry] = useState<boolean>(secureTextEntry ?? false);
  const { fieldState: { error } } = useController({ control, name });
  const hasError = useMemo(() => !!(errorMessage || error), [errorMessage, error]);

  const toggleSecuredTextEntryVisibility = () => setSecuredTextEntry((prev) => !prev);

  const conditionalIcon = useMemo(() => {
    if (iconType === 'material' && icon) {
      return <MT_Icons name={icon as keyof typeof MT_Icons.glyphMap} size={Dimensions.FONT_SIZE_L} color={hasError ? colors.danger.primary : colors.text.primary} />;
    } else if (iconType === 'antd' && icon) {
      return <Antd_Icons name={icon as keyof typeof Antd_Icons.glyphMap} size={Dimensions.FONT_SIZE_L} color={hasError ? colors.danger.primary : colors.text.primary} />;
    } else if (iconType === 'feather' && icon) {
      return <FR_Icons name={icon as keyof typeof FR_Icons.glyphMap} size={Dimensions.FONT_SIZE_L} color={hasError ? colors.danger.primary : colors.text.primary} />;
    }
    return null;
  }, [icon, iconType, hasError]);

  return (
    <View style={[globalStyles.gap_xs, containerStyle]}>
      {label ? (
        <TextBody variant="caption" strong>
          {label}
        </TextBody>
      ) : null}
      <ShakeErrorWrapper error={errorMessage || error?.message}
        style={[styles.input, globalStyles.gap_xs, hasError ? styles.inputError : undefined]}>
        {conditionalIcon}
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              style={[globalStyles.flex_1, globalStyles.gap_xs, flexBetween]}>
              <TextInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={globalStyles.flex_1}
                secureTextEntry={securedTextEntry}
                placeholderTextColor={hasError ? colors.danger.primary : colors.text.secondary}
                {...inputProps}
              />
              {
                isClearable && value ? (
                  <IconButton icon="close" onPress={() => onChange('')} size="sm" backgroundColor={colors.text.inverted} style={globalStyles.p_xs} iconType="antd" />
                ) : null
              }
            </View>
          )}
        />
        {
          secureTextEntry && (
            <PressableScale hitSlop={BUTTON_HIT_SLOP} onPress={toggleSecuredTextEntryVisibility}>
              <MT_Icons name={!securedTextEntry ? "eye" : "eye-off"} size={Dimensions.FONT_SIZE_L} color={hasError ? colors.danger.primary : colors.text.primary} />
            </PressableScale>
          )
        }
      </ShakeErrorWrapper>
      <View style={globalStyles.px_xs}>
        {hasError ? (
          <TextBody variant="caption" color="danger" style={globalStyles.text_right}>
            {errorMessage || error?.message}
          </TextBody>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    color: colors.text.default,
    borderRadius: themeToken.borderRadius,
    paddingHorizontal: themeToken.padding,
    fontSize: Dimensions.FONT_SIZE_M,
    backgroundColor: colors.primary_light,
    minHeight: Dimensions.INPUT_HEIGHT,
  },
  inputError: {
    borderColor: colors.error,
    color: colors.danger.primary,
    backgroundColor: colors.danger.light,
  },
  error: {
    marginTop: themeToken.spacingSm,
  },
});
