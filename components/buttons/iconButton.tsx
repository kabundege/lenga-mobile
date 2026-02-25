
import { Dimensions } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import { SizeVariants } from "@/utils/types/theme";
import Antd_Icons from '@expo/vector-icons/AntDesign';
import FR_Icons from '@expo/vector-icons/Feather';
import MT_Icons from '@expo/vector-icons/MaterialCommunityIcons';
import { CustomPressableProps, PressableScale } from "pressto";
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { IconName, IconType } from "../inputs/ControlledInput";

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
} & CustomPressableProps;

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

  const conditionalIcon = useMemo(() => {
    if (iconType === 'material' && icon) {
      return <MT_Icons name={icon as keyof typeof MT_Icons.glyphMap} size={iconSize} color={colors.text.primary} />;
    } else if (iconType === 'antd' && icon) {
      return <Antd_Icons name={icon as keyof typeof Antd_Icons.glyphMap} size={iconSize} color={colors.text.primary} />;
    } else if (iconType === 'feather' && icon) {
      return <FR_Icons name={icon as keyof typeof FR_Icons.glyphMap} size={iconSize} color={colors.text.primary} />;
    }
    return null;
  }, [icon, iconType, iconSize]);

  return (
    <PressableScale {...props} onPress={onPress} style={[styles.base, dynamicStyles, customStyles]}>
      {conditionalIcon}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default IconButton;
