import { TextBody } from "@/components/typography";
import { Dimensions, flexBetween, globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import { PressableScale } from "pressto";
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { scale } from "react-native-size-matters";
import Icon, { IconProps } from "./icon";

export type ChipVariant = "default" | "outlined" | "filled";

export interface ChipProps {
  /** Label text for the chip */
  label: string;
  /** Whether the chip is selected */
  selected?: boolean;
  /** Callback when chip is pressed */
  onPress?: () => void;
  /** Custom style for the chip container */
  style?: StyleProp<ViewStyle>;
  /** Whether the chip is disabled */
  disabled?: boolean;
  /** Size of the chip */
  size?: keyof typeof themeToken.controlHeight;
  /** Variant style of the chip */
  variant?: ChipVariant;
  /** Verified */
  isVerified?: boolean;
  iconProps?: IconProps;
  leftIconProps?: IconProps;
  sub?: string;
}

// Size-based dimensions (moved outside component to prevent recreation on every render)
const dimensions: {
  [key in keyof typeof themeToken.controlHeight]: ViewStyle;
} = {
  lg: {
    paddingHorizontal: Dimensions.SIZE_LG,
    paddingVertical: Dimensions.SIZE_SM,
    minHeight: scale(42),
    borderRadius: Dimensions.SIZE_L,
  },
  md: {
    paddingHorizontal: Dimensions.SIZE_L,
    paddingVertical: Dimensions.SIZE_XS,
    minHeight: scale(36),
    borderRadius: Dimensions.SIZE_L,
  },
  sm: {
    paddingHorizontal: Dimensions.SIZE_M,
    paddingVertical: Dimensions.SIZE_XS,
    minHeight: scale(30),
    borderRadius: Dimensions.SIZE_M,
  },
  xs: {
    paddingVertical: Dimensions.SIZE_XS / 2,
    paddingHorizontal: Dimensions.SIZE_SM,
    borderRadius: Dimensions.SIZE_M,
  },
};

// Size-based text variants (moved outside component to prevent recreation on every render)
const textSize: {
  [key in keyof typeof themeToken.controlHeight]: keyof typeof themeToken.fontSizes.normal;
} = {
  lg: "body1",
  md: "body2",
  sm: "body2",
  xs: "caption",
};

const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
  disabled = false,
  size = "md",
  isVerified,
  variant = "default",
  iconProps,
  leftIconProps,
  sub,
}) => {
  // Variant-based styles
  const getVariantStyle = useMemo(() => {
    if (variant === "outlined") {
      return selected ? styles.chipOutlinedSelected : styles.chipOutlined;
    }
    if (variant === "filled") {
      return selected ? styles.chipFilledSelected : styles.chipFilled;
    }
    // default variant
    return selected ? styles.chipSelected : styles.chipUnselected;
  }, [variant, selected]);

  const chipStyle = useMemo(
    () => [
      flexBetween,
      globalStyles.gap_xs,
      dimensions[size],
      getVariantStyle,
      disabled && styles.chipDisabled,
      sub && globalStyles.flex_col,
      style,
    ],
    [size, getVariantStyle, disabled, style]
  );

  const textColor = useMemo(() => {
    if (variant === "filled" && selected) {
      return colors.text.inverted;
    }
    return colors.text.default;
  }, [variant, selected]);

  const Wrapper = disabled || !onPress ? View : PressableScale;

  return (
    <Wrapper onPress={onPress} style={chipStyle}>
      {leftIconProps ? <Icon {...leftIconProps} /> : null}
      <View>
        <TextBody
          strong={selected}
          variant={textSize[size]}
          style={{ color: textColor }}
        >
          {label}
        </TextBody>
        {sub && (
          <TextBody strong color="primary" center style={globalStyles.text_sm}>
            {sub}
          </TextBody>
        )}
      </View>
      {isVerified && iconProps ? <Icon {...iconProps} /> : null}
    </Wrapper>
  );
};

const styles = StyleSheet.create({

  // Default variant
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.text.inverted,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  // Outlined variant
  chipOutlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  chipOutlinedSelected: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  // Filled variant
  chipFilled: {
    backgroundColor: colors.background.secondary,
    borderWidth: 0,
  },
  chipFilledSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  chipDisabled: {
    opacity: 0.5,
  },
});

export default Chip;
