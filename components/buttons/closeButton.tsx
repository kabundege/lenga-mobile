import OpacityButton from '@/components/buttons/OpacityButton';
import { ReactNode } from 'react';

type Props = {
  onPress: () => void;
  children?: ReactNode;
};

const CloseButton = ({ onPress, children }: Props) => (
  <OpacityButton onPress={onPress}>
    {children}
  </OpacityButton>
);


export default CloseButton;
