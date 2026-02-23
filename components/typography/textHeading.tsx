import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { TextColorVariants } from '@/utils/types/theme';
import { Text, TextProps, TextStyle } from 'react-native';

type Props = Omit<
  {
    variant: keyof typeof themeToken.fontSizes.heading;
    center?: boolean;
    color?: TextColorVariants;
  } & TextProps,
  'fontWeight' // Use fontWeight in style (aligned with themed-text title/subtitle)
>;

export const TextHeading = (props: Props) => {
  const { variant, color = 'default' } = props;
  const fontSize = themeToken.fontSizes.heading[variant];

  const dynamicStyles: TextStyle = {
    textAlign: props.center ? 'center' : 'left',
    fontSize,
    lineHeight: Math.round(fontSize * 1.2), // Match themed-text title (proportional)
    color: colors.text[color],
    fontWeight: 'bold', // Align with themed-text title/subtitle
  };

  return (
    <Text {...props} style={[dynamicStyles, props.style]}>
      {props.children}
    </Text>
  );
};
