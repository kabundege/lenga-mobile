import React from 'react';
import { ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';

type Props = {
  showToolbar?: boolean;
} & ScrollViewProps;

const WithKeyboardScrollView = ({ children, showToolbar = true, ...props }: Props) => {
  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={showToolbar ? 72 : undefined} // Bottom offset px of the keyboard toolbar
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </KeyboardAwareScrollView>
      {showToolbar && <KeyboardToolbar />}
    </>
  );
};

export default WithKeyboardScrollView;
