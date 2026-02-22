import OpacityButton from '@/components/buttons/OpacityButton';
import { themeToken } from '@/utils/theme/styles';
import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

type Props = {
  children?: ReactNode;
  onPress: () => void;
};

const BackButton = ({ onPress, children }: Props) => (
  <OpacityButton onPress={onPress} style={styles.container}>
    {children}
  </OpacityButton>
);

export default BackButton;

const styles = StyleSheet.create({
  container: {
    padding: themeToken.padding,
  },
});
