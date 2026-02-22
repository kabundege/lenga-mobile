import { CustomPressableProps, PressableOpacity } from 'pressto';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

type CustomPressableOpacityProps = Omit<CustomPressableProps, 'delayLongPress'> & {
  disabled?: boolean;
  onLongPressDelay?: number;
  style?: StyleProp<ViewStyle>;
};

const OpacityButton: React.FC<CustomPressableOpacityProps> = ({
  onLongPressDelay,
  disabled = false,
  onLongPress,
  onPress,
  style,
  ...rest
}) => {
  const handlePress = (e: any) => {
    if (disabled) {
      return;
    }
    onPress?.(e);
  };

  const handleLongPress = () => {
    if (disabled) {
      return;
    }
    if (typeof onLongPress === 'function') {
      if (onLongPressDelay) {
        const id = setTimeout(() => {
          onLongPress();
          clearTimeout(id);
        }, onLongPressDelay);
      } else {
        onLongPress();
      }
    }
  };

  return (
    <PressableOpacity
      {...rest}
      style={style}
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
    />
  );
};

export default OpacityButton;
