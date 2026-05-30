import React from 'react';
import { ScrollViewProps } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';

type Props = {
  showToolbar?: boolean;
} & ScrollViewProps &
  Pick<KeyboardAwareScrollViewProps, 'bottomOffset' | 'extraKeyboardSpace'>;

const WithKeyboardScrollView = ({
  children,
  showToolbar: _showToolbar = true,
  bottomOffset = 16,
  ...props
}: Props) => {
  return (
    <KeyboardAwareScrollView
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={bottomOffset}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default WithKeyboardScrollView;
