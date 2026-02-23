import { ReactNode, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { Easing } from 'react-native-reanimated';

import { FontWeight } from '@/hooks/useAppFont';
import { BUTTON_HIT_SLOP } from '@/utils/constants';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { TextColorVariants } from '@/utils/types/theme';

export type TextBodyProps = {
  variant?: keyof typeof themeToken.fontSizes.normal;
  strong?: boolean;
  center?: boolean;
  color?: TextColorVariants;
  fontWeight?: FontWeight;
  underline?: boolean;
  readMore?: boolean;
  maxLength?: number;
  onReadMoreClick?: () => void;
  readMoreVariant?: 'collapsible' | 'modal';
  readMoreModalTitle?: string;
} & TextProps;

// Map FontWeight to RN fontWeight string (aligned with themed-text.tsx)
const fontWeightMap: Record<FontWeight, TextStyle['fontWeight']> = {
  extraLight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extra: '800',
};

export const TextBody = ({
  variant = 'body1',
  strong,
  fontWeight = 'normal',
  underline,
  color = 'default',
  readMore,
  maxLength = 100,
  onReadMoreClick,
  readMoreVariant = 'modal',
  children,
  center,
  style,
  readMoreModalTitle = 'Description',
  ...rest
}: TextBodyProps) => {

  const [isExpanded, setIsExpanded] = useState(false);
  const [showTruncatedText, setShowTruncatedText] = useState(true);

  const animationDuration = 200;
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const flattenText = (node: ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return `${node}`;
    if (Array.isArray(node)) return node.map(flattenText).join('');
    if (isValidElement(node)) return flattenText((node.props as any)?.children);
    return '';
  };

  const textContent = useMemo(() => flattenText(children), [children]);
  const shouldTruncate = readMore && textContent.length > maxLength;

  const displayText =
    shouldTruncate && !isExpanded && showTruncatedText
      ? `${textContent.substring(0, maxLength)} ...`
      : textContent;

  const handleReadMoreToggle = () => {
    if (readMoreVariant === 'modal') {
      if (onReadMoreClick) {
        onReadMoreClick();
      }
    } else {
      setIsExpanded((prev) => !prev);
    }
  };

  useEffect(() => {
    if (readMoreVariant !== 'collapsible') return;

    if (isExpanded) setShowTruncatedText(false);

    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: animationDuration,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      if (!isExpanded) setShowTruncatedText(true);
    });
  }, [isExpanded, readMoreVariant]);

  const fontSize = themeToken.fontSizes.normal[variant];
  const baseTextStyle: TextStyle = {
    textAlign: center ? 'center' : 'left',
    color: colors.text[color],
    fontSize,
    lineHeight: Math.round(fontSize * (24 / 16)), // Match themed-text default (24/16)
    textDecorationLine: underline ? 'underline' : undefined,
    fontWeight: strong ? '600' : fontWeightMap[fontWeight], // themed-text: defaultSemiBold = '600'
  };

  const ReadMoreText = () =>
    shouldTruncate ? <Text style={styles.readMore}>{isExpanded ? ' Read less' : ' Read more'}</Text> : null;

  const RenderText = () => (
    <Text {...rest} style={[baseTextStyle, style]}>
      {displayText}
      {ReadMoreText()}
    </Text>
  );

  if (shouldTruncate && readMoreVariant === 'collapsible') {
    return (
      <Pressable hitSlop={BUTTON_HIT_SLOP} onPress={handleReadMoreToggle}>
        <Animated.View
          style={[
            styles.collapsibleContainer,
            {
              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 0.3],
                outputRange: [100, 300],
              }),
            },
          ]}
        >
          {RenderText()}
        </Animated.View>
      </Pressable>
    );
  }

  if (shouldTruncate && readMoreVariant === 'modal') {
    return (
      <Pressable hitSlop={BUTTON_HIT_SLOP} onPress={handleReadMoreToggle}>
        {RenderText()}
      </Pressable>
    );
  }

  return (
    <Text {...rest} style={[baseTextStyle, style]}>
      {textContent}
    </Text>
  );
};

const styles = StyleSheet.create({
  readMore: {
    color: colors.text.primary,
  },
  collapsibleContainer: {
    overflow: 'hidden',
  },
});
