import { GenderSelectField } from '@/app/onboarding/components/GenderSelectField';
import { LocationSelectFields } from '@/app/onboarding/components/LocationSelectFields';
import { ProfileFormSection } from '@/app/onboarding/components/ProfileFormSection';
import { ControlledInput } from '@/components/inputs/ControlledInput';
import type { ExtendedProfileFormValues } from '@/utils/validations/extendedProfile';
import {
  Control,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form';

type UserInfoSectionProps = {
  control: Control<ExtendedProfileFormValues>;
  errors: FieldErrors<ExtendedProfileFormValues>;
  setValue: UseFormSetValue<ExtendedProfileFormValues>;
};

export function UserInfoSection({ control, errors, setValue }: UserInfoSectionProps) {
  return (
    <ProfileFormSection
      title="Amakuru yawe"
      description="Amakuru y'ibanze n'aho utuye."
    >
      <GenderSelectField control={control} errors={errors} />

      <ControlledInput
        control={control}
        name="age"
        label="Imyaka"
        keyboardType="number-pad"
        errorMessage={errors.age?.message}
      />

      <LocationSelectFields control={control} errors={errors} setValue={setValue} />
    </ProfileFormSection>
  );
}
