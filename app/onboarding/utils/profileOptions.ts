import type { Gender } from '@/types/analytics';
import { GENDER_OPTIONS } from '@/utils/validations/extendedProfile';

export const GENDER_LABELS: Record<Gender, string> = {
  Male: 'Gabo',
  Female: 'Gore',
  Other: 'Ikindi',
  PreferNotToSay: 'Ntibishaka kuvugwa',
};

export const genderSelectOptions = GENDER_OPTIONS.map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));

export const yesNoOptions = [
  { value: true, label: 'Yego' },
  { value: false, label: 'Oya' },
] as const;
