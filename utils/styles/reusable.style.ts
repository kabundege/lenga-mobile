import globalStyles from "./globalstyles.style";

export const centered = globalStyles.center;
export const screen = [globalStyles.flex_1, globalStyles.bg_background];
export const itemStart = [globalStyles.flex_row, globalStyles.items_start];
export const itemEnd = [globalStyles.flex_row, globalStyles.items_end];
export const flexStart = [globalStyles.flex_row, globalStyles.items_center];
export const flexEnd = [
  globalStyles.between,
  globalStyles.flex_row,
  globalStyles.items_end,
];
export const flexAround = [
  globalStyles.around,
  globalStyles.flex_row,
  globalStyles.items_center,
];
export const flexBetween = [
  globalStyles.between,
  globalStyles.flex_row,
  globalStyles.items_center,
];
export const floatingGradientOverlay = [
  globalStyles.absolute,
  globalStyles.w_full,
  globalStyles.hs_10,
  globalStyles.top_0,
  globalStyles.left_0,
  globalStyles.right_0,
];
