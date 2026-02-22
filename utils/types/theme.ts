import { themeToken } from '@/utils/theme/styles';

export type ColorVariants = 'primary' | 'secondary' | 'tertiary' | 'brandPrimary';
export type TextColorVariants = 'primary' | 'secondary' | 'default' | 'danger';
export type SizeVariants = keyof typeof themeToken.sizes;
