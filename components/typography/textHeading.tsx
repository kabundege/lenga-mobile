import { getFontFamily } from '@/hooks/useAppFont';
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
  'fontWeight' // Infavour of using our custom URBANIST font family weight
>;

export const TextHeading = (props: Props) => {
  const { variant, color = 'default' } = props;

  const dynamicStyles: TextStyle = {
    textAlign: props.center ? 'center' : 'left',
    fontSize: themeToken.fontSizes.heading[variant],
    color: colors.text[color],
    fontFamily: getFontFamily('bold'),
  };

  return (
    <Text {...props} style={[dynamicStyles, props.style]}>
      {props.children}
    </Text>
  );
};
