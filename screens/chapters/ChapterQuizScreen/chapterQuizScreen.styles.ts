import { Dimensions, globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import { StyleSheet } from "react-native";

export const chapterQuizScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  grid: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    rowGap: Dimensions.SIZE_XL,
  },
  quizContent: {
    ...globalStyles.py_md,
    rowGap: themeToken.spacing,
  },
  quizContextWrap: {
    marginBottom: themeToken.spacing,
    marginHorizontal: themeToken.padding,
  },
  quizCard: {
    borderWidth: 1,
    padding: themeToken.padding,
    marginTop: themeToken.spacingSm,
    borderColor: colors.border.primary,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.secondary,
  },
  emptyState: {
    paddingVertical: themeToken.paddingLg,
    alignItems: "center",
  },
  videoCtaCard: {
    padding: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
});
