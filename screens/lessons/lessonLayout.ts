import { Dimensions } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';

export const CHAPTER_CARD_WIDTH = (Dimensions.SCREEN_WIDTH - themeToken.spacingLg * 2) * 0.8;
export const CHAPTER_CARD_SPACING = Dimensions.SIZE_M;
export const CHAPTER_SNAP_INTERVAL = CHAPTER_CARD_WIDTH + CHAPTER_CARD_SPACING;
export const DEFAULT_LIST_HEIGHT = Dimensions.SCREEN_HEIGHT - Dimensions.SIZE_M * 5;

