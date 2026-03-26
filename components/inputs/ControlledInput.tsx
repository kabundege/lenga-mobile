import { Icon, type IconName, type IconType } from '@/components/common/icon';
import { TextBody } from '@/components/typography/textBody';
import { BUTTON_HIT_SLOP } from '@/utils/constants';
import { Dimensions, flexBetween } from '@/utils/styles';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
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
import Animated, { BounceIn, BounceOut } from 'react-native-reanimated';
import IconButton from '../buttons/iconButton';
import { ShakeErrorWrapper } from '../ui/shakeErrorWrapper';

export type { IconName, IconType };

export type ControlledInputProps<T extends FieldValues> = {
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

  const iconColor = hasError ? colors.danger.primary : colors.text.primary;
  const conditionalIcon = useMemo(
    () =>
      icon ? (
        <Icon
          name={icon}
          type={iconType}
          size={Dimensions.FONT_SIZE_L}
          color={iconColor}
        />
      ) : null,
    [icon, iconType, iconColor]
  );

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
        <View style={globalStyles.flex_grow}>
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[globalStyles.flex_grow, globalStyles.gap_xs, flexBetween, globalStyles.overflow_hidden]}>
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={globalStyles.flex_grow}
                  secureTextEntry={securedTextEntry}
                  placeholderTextColor={hasError ? colors.danger.primary : colors.text.secondary}
                  {...inputProps}
                />
                {
                  isClearable && value ? (
                    <Animated.View entering={BounceIn} exiting={BounceOut}>
                      <IconButton icon="close" onPress={() => onChange('')} size="sm" backgroundColor={colors.text.inverted} style={globalStyles.p_xs} iconType="antd" />
                    </Animated.View>
                  ) : null
                }
              </View>
            )}
          />
        </View>
        {
          secureTextEntry && (
            <PressableScale hitSlop={BUTTON_HIT_SLOP} onPress={toggleSecuredTextEntryVisibility}>
              <Icon
                name={securedTextEntry ? 'eye-off' : 'eye'}
                size={Dimensions.FONT_SIZE_L}
                color={iconColor}
                type="material"
              />
            </PressableScale>
          )
        }
      </ShakeErrorWrapper>

      {hasError ? (
        <View style={globalStyles.px_xs}>
          <TextBody variant="caption" color="danger" style={globalStyles.text_right}>
            {errorMessage || error?.message}
          </TextBody>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    color: colors.text.default,
    fontSize: Dimensions.FONT_SIZE_M,
    minHeight: Dimensions.INPUT_HEIGHT,
    borderRadius: themeToken.borderRadius,
    paddingHorizontal: themeToken.padding,
    backgroundColor: colors.primary_light,
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
