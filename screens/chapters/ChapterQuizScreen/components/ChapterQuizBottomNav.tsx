import Button from "@/components/buttons/button";
import { flexBetween, globalStyles } from "@/utils/styles";
import { themeToken } from "@/utils/theme/styles";
import { View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

type NavButtonStyles = {
  isDisabled: boolean;
  color: string;
  bgStyles: Record<string, unknown>;
};

type ChapterQuizBottomNavProps = {
  insets: EdgeInsets;
  showMainNav: boolean;
  isLastSlide: boolean;
  backButton: NavButtonStyles;
  nextButton: NavButtonStyles;
  onBack: () => void;
  onNext: () => void;
};

export const ChapterQuizBottomNav = ({
  insets,
  showMainNav,
  isLastSlide,
  backButton,
  nextButton,
  onBack,
  onNext,
}: ChapterQuizBottomNavProps) => {
  if (!showMainNav) return null;

  return (
    <View
      style={[
        flexBetween,
        globalStyles.px_md,
        { paddingBottom: insets.bottom + themeToken.paddingSm },
      ]}
    >
      <Button
        size="sm"
        type="primary"
        label="Ibibanza"
        textStyles={globalStyles.w_auto}
        textColor={backButton.color}
        disabled={backButton.isDisabled}
        onPress={onBack}
        leftIcon={{ name: "chevron-left", color: backButton.color }}
        overRiddingStyles={[globalStyles.w_40, backButton.bgStyles]}
      />
      <Button
        size="sm"
        type="primary"
        label={isLastSlide ? "Sohoka" : "Ibikurikira"}
        textColor={nextButton.color}
        textStyles={globalStyles.w_auto}
        disabled={nextButton.isDisabled}
        overRiddingStyles={[globalStyles.w_40, nextButton.bgStyles]}
        rightIcon={{ name: "chevron-right", color: nextButton.color }}
        onPress={onNext}
      />
    </View>
  );
};
