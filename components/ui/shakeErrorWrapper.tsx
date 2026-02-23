import { triggerHaptic } from "@/utils/functions/haptics";
import { ReactNode, useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";


interface ShakeErrorWrapperProps {
    error?: string;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const ShakeErrorWrapper: React.FC<ShakeErrorWrapperProps> = ({
    error,
    children,
    style,
}) => {
    const hasError = !!error;
    const shakeAnimation = useSharedValue(0);

    // Trigger shake animation and haptic when error appears
    useEffect(() => {
        if (hasError) {
            triggerHaptic(); // adds haptic feedback
            shakeAnimation.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-5, { duration: 50 }),
                withTiming(5, { duration: 50 }),
                withTiming(0, { duration: 50 }),
            );
        }
    }, [hasError, shakeAnimation]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeAnimation.value }],
    }));

    return (
        <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    );
};