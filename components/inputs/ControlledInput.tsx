import { TextBody } from '@/components/typography/textBody';
import dimensionsStyle from '@/utils/styles/dimensions.style';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import MT_Icons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
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
import { ShakeErrorWrapper } from '../ui/shakeErrorWrapper';

type ControlledInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  containerStyle?: ViewStyle;
  errorMessage?: string;
  icon?: keyof typeof MT_Icons.glyphMap;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  containerStyle,
  errorMessage,
  secureTextEntry,
  icon,
  ...inputProps
}: ControlledInputProps<T>) {
  const { fieldState: { error } } = useController({ control, name });
  const hasError = useMemo(() => !!(errorMessage || error), [errorMessage, error]);

  return (
    <View style={[globalStyles.gap_xs, containerStyle]}>
      {label ? (
        <TextBody variant="caption" strong>
          {label}
        </TextBody>
      ) : null}
      <ShakeErrorWrapper error={errorMessage || error?.message}
        style={[styles.input, hasError ? styles.inputError : undefined]}>
        <MT_Icons name={icon} size={dimensionsStyle.FONT_SIZE_L} color={hasError ? colors.danger.primary : colors.text.primary} />
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ''}
              style={globalStyles.flex_1}
              placeholderTextColor={hasError ? colors.danger.primary : colors.text.secondary}
              secureTextEntry={secureTextEntry}
              {...inputProps}
            />
          )}
        />
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
    gap: themeToken.spacingSm,
    borderRadius: themeToken.borderRadius,
    paddingHorizontal: themeToken.padding,
    fontSize: dimensionsStyle.FONT_SIZE_M,
    color: colors.text.default,
    minHeight: dimensionsStyle.INPUT_HEIGHT,
    backgroundColor: colors.background.secondary,
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
