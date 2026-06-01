import { FormSelectField } from '@/screens/onboarding/components/FormSelectField';
import { genderSelectOptions } from '@/screens/onboarding/utils/profileOptions';
import type { Gender } from '@/types/analytics';
import type { ExtendedProfileFormValues } from '@/utils/validations/extendedProfile';
import { Control, Controller, FieldErrors } from 'react-hook-form';

type GenderSelectFieldProps = {
  control: Control<ExtendedProfileFormValues>;
  errors: FieldErrors<ExtendedProfileFormValues>;
};

export function GenderSelectField({ control, errors }: GenderSelectFieldProps) {
  return (
    <Controller
      control={control}
      name="gender"
      render={({ field: { value, onChange } }) => (
        <FormSelectField<Gender>
          label="Igitsina"
          placeholder="Hitamo igitsina"
          modalTitle="Hitamo igitsina"
          value={value}
          options={genderSelectOptions}
          onChange={onChange}
          errorMessage={errors.gender?.message}
        />
      )}
    />
  );
}
