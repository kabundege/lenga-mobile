import Loader from '@/components/loader';
import { TextBody } from '@/components/typography/textBody';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { SizeVariants } from '@/utils/types/theme';
import { CustomPressableProps, PressableScale } from 'pressto';
import React, { ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { scale } from 'react-native-size-matters';

export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'outlined' | 'danger' | 'success';

export type ButtonProps = {
  type: ButtonType;
  disabled?: boolean;
  size: keyof typeof themeToken.controlHeight;
  label?: string;
  rounded?: boolean;
  loading?: boolean;
  isBlock?: boolean;
  textColor?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  numberOfLines?: number;
  styles?: StyleProp<ViewStyle>;
  customIconSize?: SizeVariants;
  overRiddingStyles?: StyleProp<ViewStyle>;
} & CustomPressableProps;

const Button = ({ size = 'md', numberOfLines, customIconSize, rounded = false, ...props }: ButtonProps) => {
  const dimensions: { [key in ButtonProps['size']]: ViewStyle } = {
    lg: {
      paddingHorizontal: 25,
    },
    md: {
      paddingHorizontal: 20,
    },
    sm: {
      paddingHorizontal: 15,
    },
  };

  const textSize: {
    [key in ButtonProps['size']]: keyof typeof themeToken.fontSizes.normal;
  } = {
    lg: 'body1',
    md: 'body2',
    sm: 'body2',
  };

  const textColor = useMemo(
    () =>
      props.textColor ??
      (props.type === 'danger'
        ? colors.danger.primary
        : props.type === 'success'
          ? colors.success.primary
          : props.type === "outlined" ? colors.text.default : colors.text.inverted),
    [props.type, props.textColor]
  );

  const dynamicStyles: ViewStyle = {
    borderRadius: rounded ? 50 : themeToken.borderRadius,
    width: props.isBlock ? '100%' : 'auto',
    height: themeToken.controlHeight[size],
    ...dimensions[size],
  };

  const Wrapper = props.disabled ? View : PressableScale;
  const WrapperProps = props.disabled ? {} : props;

  return (
    <Wrapper
      {...WrapperProps}
      style={[
        props.styles,
        styles.base,
        styles[props.type],
        dynamicStyles,
        // Overriding styles to take priority
        props.overRiddingStyles,
      ]}
    >

      {props.loading ? (
        <Loader />
      ) : (
        <>
          {props.iconLeft}
          {props?.label && (
            <TextBody
              strong
              center
              color="default"
              variant={textSize[size]}
              numberOfLines={numberOfLines}
              style={[textColor ? { color: textColor } : undefined, globalStyles.uppercase, globalStyles.w_full]}
            >
              {props.label}
            </TextBody>
          )}
          {props.iconRight}
        </>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scale(8),
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.background.secondary,
  },
  tertiary: {
    backgroundColor: colors.background.tertiary,
  },
  outlined: {
    borderColor: colors.border.primary,
    borderWidth: 1,
  },

  opacityFaded: {
    opacity: 0.5,
  },
  opacityFull: {
    opacity: 1,
  },
  danger: {
    backgroundColor: colors.danger.tertiary,
  },
  success: {
    backgroundColor: colors.success.tertiary,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: themeToken.borderRadius,
  },
});

export default Button;
