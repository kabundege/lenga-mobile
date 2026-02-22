import colors from '@/utils/theme/colors';
import { TextColorVariants } from '@/utils/types/theme';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';

type Props = {
  color?: TextColorVariants;
} & ActivityIndicatorProps;

const Loader = ({ color = 'default', ...props }: Props) => {
  return <ActivityIndicator {...props} color={colors.text[color]} />;
};

export default Loader;
