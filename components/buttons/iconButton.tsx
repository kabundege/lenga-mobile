import { Icon, type IconName, type IconType } from "@/components/common/icon";
import { Dimensions } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import { SizeVariants } from "@/utils/types/theme";
import { CustomPressableProps, PressableScale } from "pressto";
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  size?: SizeVariants;
  backgroundColor?: string;
  iconFill?: string;
  iconStroke?: string;
  rounded?: boolean;
  padding?: number;
  styles?: StyleProp<ViewStyle>;
  iconType?: IconType;
  disabled?: boolean;
} & CustomPressableProps & ViewProps;

const IconButton = ({
  icon,
  onPress,
  size = "md",
  backgroundColor = colors.black,
  iconFill = "transparent",
  iconStroke,
  rounded = true,
  padding = Dimensions.SIZE_SM,
  style: customStyles,
  iconType,
  disabled = false,
  ...props
}: IconButtonProps) => {
  const dynamicStyles: ViewStyle = {
    padding,
    backgroundColor,
    borderRadius: rounded ? 50 : themeToken.borderRadius,
  };

  const iconSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return Dimensions.FONT_SIZE_SM;
      case 'md':
        return Dimensions.FONT_SIZE_M;
      case 'lg':
        return Dimensions.FONT_SIZE_LG;
      default:
        return Dimensions.FONT_SIZE_L;
    }
  }, [size]);

  const conditionalIcon = useMemo(
    () => (
      <Icon
        name={icon}
        type={iconType}
        size={iconSize}
        color={iconStroke ?? iconFill ?? colors.text.primary}
      />
    ),
    [icon, iconType, iconSize, iconFill, iconStroke]
  );

  const Wrapper = disabled ? View : PressableScale;
  const WrapperProps = disabled ? {} : { onPress };

  return (
    <Wrapper {...WrapperProps} {...props} style={[styles.base, dynamicStyles, customStyles]}>
      {conditionalIcon}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default IconButton;
