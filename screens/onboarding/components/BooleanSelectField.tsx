import { FormSelectField } from '@/screens/onboarding/components/FormSelectField';
import { yesNoOptions } from '@/screens/onboarding/utils/profileOptions';
import type { ExtendedProfileFormValues } from '@/utils/validations/extendedProfile';
import { Control, Controller } from 'react-hook-form';

type BooleanFieldName = 'is_pwd' | 'is_cooperative_member';

type BooleanSelectFieldProps = {
  control: Control<ExtendedProfileFormValues>;
  name: BooleanFieldName;
  label: string;
};

export function BooleanSelectField({ control, name, label }: BooleanSelectFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <FormSelectField<boolean>
          label={label}
          placeholder="Hitamo"
          modalTitle={label}
          value={value}
          options={[...yesNoOptions]}
          onChange={onChange}
        />
      )}
    />
  );
}
