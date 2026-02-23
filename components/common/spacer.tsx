import { Dimensions } from "@/utils/styles";
import { View, ViewProps } from "react-native";

interface SpacerProps extends ViewProps {
    height?: number;
}

const Spacer = ({ height = Dimensions.SCREEN_HEIGHT * 0.1, style, ...props }: SpacerProps) => (
    <View style={[{ height }, style]} {...props} />
);

export default Spacer;