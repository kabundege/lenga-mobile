import { TextBody } from '@/components/typography/textBody';
import { BUTTON_HIT_SLOP } from '@/utils/constants';
import dimensionsStyle from '@/utils/styles/dimensions.style';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
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
  const [securedTextEntry, setSecuredTextEntry] = useState<boolean>(secureTextEntry ?? false);
  const { fieldState: { error } } = useController({ control, name });
  const hasError = useMemo(() => !!(errorMessage || error), [errorMessage, error]);


  const toggleSecuredTextEntryVisibility = () => setSecuredTextEntry((prev) => !prev);

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
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={globalStyles.flex_1}
              secureTextEntry={securedTextEntry}
              placeholderTextColor={hasError ? colors.danger.primary : colors.text.secondary}
              {...inputProps}
            />
          )}
        />
        {
          secureTextEntry && (
            <PressableScale hitSlop={BUTTON_HIT_SLOP} onPress={toggleSecuredTextEntryVisibility}>
              <MT_Icons name={!securedTextEntry ? "eye" : "eye-off"} size={dimensionsStyle.FONT_SIZE_L} color={hasError ? colors.danger.primary : colors.text.primary} />
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
