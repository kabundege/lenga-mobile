import { TextBody, TextBodyProps } from "@/components/typography";
import { Dimensions, flexStart, globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { SizeVariants } from "@/utils/types/theme";
import MT_Icons from '@expo/vector-icons/MaterialCommunityIcons';
import { PressableScale } from "pressto";
import React, { useMemo } from "react";
import { StyleProp, TextStyle, View } from "react-native";

interface LinkButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: TextBodyProps["variant"];
  color?: TextBodyProps["color"];
  strong?: boolean;
  text?: string;
  icon?: keyof typeof MT_Icons.glyphMap;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  iconSize?: SizeVariants;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  color = "secondary",
  variant = "body2",
  strong = false,
  numberOfLines,
  iconSize = "md",
  children,
  onPress,
  style,
  text,
  icon,
}) => {
  const Wrapper = onPress ? PressableScale : View;

  const iconSizeMap = useMemo(() => {
    switch (iconSize) {
      case "xl":
        return Dimensions.FONT_SIZE_XS;
      case "sm":
        return Dimensions.FONT_SIZE_SM;
      case "md":
        return Dimensions.FONT_SIZE_M;
      case "lg":
        return Dimensions.FONT_SIZE_L;
      case "2xl":
        return Dimensions.FONT_SIZE_XL;
      case "3xl":
        return Dimensions.FONT_SIZE_2XL;
      default:
        return Dimensions.FONT_SIZE_L;
    }
  }, [iconSize]);
  return (
    <Wrapper style={[flexStart, globalStyles.gap_2xs]} onPress={onPress}>
      {icon && (
        <MT_Icons
          name={icon}
          size={iconSizeMap}
          stroke={colors.black}
          fill={colors.border.secondary}
        />
      )}
      {typeof children === "string" || text ? (
        <TextBody
          color={color}
          strong={strong}
          variant={variant}
          numberOfLines={numberOfLines}
          style={[globalStyles.link_text, style]}
        >
          {children || text}
        </TextBody>
      ) : (
        children
      )}
    </Wrapper>
  );
};

export default LinkButton;
