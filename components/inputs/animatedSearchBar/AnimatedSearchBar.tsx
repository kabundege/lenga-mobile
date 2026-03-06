import { TextBody } from '@/components/typography/textBody';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { PressableScale } from 'pressto';
import React, { useEffect, useRef } from 'react';
import { FieldValues, useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ControlledInput, ControlledInputProps } from '../ControlledInput';

const ANIM_DURATION = 200;
const EXPANDED_HEIGHT = Dimensions.INPUT_HEIGHT + 16;

export type AnimatedSearchBarProps = {
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  style?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyles?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
  marginBottom?: number;
} & ControlledInputProps<FieldValues>

export function AnimatedSearchBar({
  visible,
  onVisibilityChange,
  style,
  inputContainerStyle,
  containerStyle,
  inputStyles,
  autoFocus = true,
  marginBottom = Dimensions.SIZE_SM,
  ...inputProps
}: AnimatedSearchBarProps) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const margin = useSharedValue(0);

  const { field } = useController({ control: inputProps.control, name: inputProps.name });

  useEffect(() => {
    height.value = withTiming(visible ? EXPANDED_HEIGHT : 0, {
      duration: ANIM_DURATION,
    });
    opacity.value = withTiming(visible ? 1 : 0, { duration: ANIM_DURATION });
    margin.value = withTiming(visible ? marginBottom : 0, {
      duration: ANIM_DURATION,
    });
  }, [visible, marginBottom, height, opacity, margin]);

  useEffect(() => {
    if (visible && autoFocus) {
      const id = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [visible, autoFocus]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    marginBottom: margin.value,
    overflow: 'hidden' as const,
  }));

  const handleClose = () => {
    Keyboard.dismiss();
    field.onChange('');
    onVisibilityChange(false);
  };

  return (
    <Animated.View style={[animatedContainerStyle, style]}>
      <View
        style={[
          flexBetween,
          globalStyles.gap_xs,
          styles.row,
          containerStyle,
        ]}
      >
        <View style={[globalStyles.flex_1, style]}>
          <ControlledInput {...inputProps} style={[globalStyles.w_full, style]} />
        </View>
        {
          handleClose && (
            <PressableScale onPress={handleClose}>
              <TextBody variant="body2" color="primary">
                {t('global.buttons.cancel')}
              </TextBody>
            </PressableScale>
          )
        }
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: Dimensions.INPUT_HEIGHT,
    alignItems: 'center',
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeToken.spacingSm,
    paddingHorizontal: themeToken.padding,
    minHeight: Dimensions.INPUT_HEIGHT,
  },
  input: {
    flex: 1,
    fontSize: Dimensions.FONT_SIZE_M,
    color: colors.text.default,
    paddingVertical: themeToken.spacingSm,
  },
});
