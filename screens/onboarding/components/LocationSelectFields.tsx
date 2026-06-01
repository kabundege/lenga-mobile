import { FormSelectField } from '@/screens/onboarding/components/FormSelectField';
import {
  useRwandaDistricts,
  useRwandaSectors,
} from '@/screens/onboarding/hooks/useRwandaLocations';
import type { ExtendedProfileFormValues } from '@/utils/validations/extendedProfile';
import { useEffect, useMemo } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { ActivityIndicator, View } from 'react-native';
import { TextBody } from '@/components/typography';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';

type LocationSelectFieldsProps = {
  control: Control<ExtendedProfileFormValues>;
  errors: FieldErrors<ExtendedProfileFormValues>;
  setValue: UseFormSetValue<ExtendedProfileFormValues>;
};

export function LocationSelectFields({
  control,
  errors,
  setValue,
}: LocationSelectFieldsProps) {
  const districtValue = useWatch({ control, name: 'district' });
  const sectorValue = useWatch({ control, name: 'sector' });
  const { data: districts = [], isLoading: isLoadingDistricts } = useRwandaDistricts();
  const { data: sectors = [], isLoading: isLoadingSectors } = useRwandaSectors(districtValue ?? '');

  const districtOptions = useMemo(
    () => districts.map((district) => ({ value: district.name, label: district.name })),
    [districts],
  );

  const sectorOptions = useMemo(
    () => sectors.map((sector) => ({ value: sector.name, label: sector.name })),
    [sectors],
  );

  useEffect(() => {
    if (!districtValue) {
      if (sectorValue) {
        setValue('sector', '', { shouldValidate: true });
      }
      return;
    }

    if (sectorValue && !sectors.some((sector) => sector.name === sectorValue)) {
      setValue('sector', '', { shouldValidate: true });
    }
  }, [districtValue, sectorValue, sectors, setValue]);

  if (isLoadingDistricts) {
    return (
      <View style={[globalStyles.items_center, globalStyles.py_md]}>
        <ActivityIndicator color={colors.primary} />
        <TextBody variant="caption" color="secondary">
          Amakuru y&apos;uturere arapakira...
        </TextBody>
      </View>
    );
  }

  return (
    <>
      <Controller
        control={control}
        name="district"
        render={({ field: { value, onChange } }) => (
          <FormSelectField<string>
            label="Akarere"
            placeholder="Hitamo akarere"
            modalTitle="Hitamo akarere"
            value={value || undefined}
            options={districtOptions}
            onChange={onChange}
            searchable
            searchPlaceholder="Shaka akarere..."
            errorMessage={errors.district?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="sector"
        render={({ field: { value, onChange } }) => (
          <FormSelectField<string>
            label="Umurenge"
            placeholder={districtValue ? 'Hitamo umurenge' : 'Hitamo akarere mbere'}
            modalTitle="Hitamo umurenge"
            value={value || undefined}
            options={sectorOptions}
            onChange={onChange}
            disabled={!districtValue || isLoadingSectors}
            errorMessage={errors.sector?.message}
          />
        )}
      />
    </>
  );
}
