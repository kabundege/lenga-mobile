import { BooleanSelectField } from "@/app/onboarding/components/BooleanSelectField";
import { ProfileFormSection } from "@/app/onboarding/components/ProfileFormSection";
import { ControlledInput } from "@/components/inputs/ControlledInput";
import type { ExtendedProfileFormValues } from "@/utils/validations/extendedProfile";
import { Control, FieldErrors } from "react-hook-form";

type BusinessInfoSectionProps = {
  control: Control<ExtendedProfileFormValues>;
  errors: FieldErrors<ExtendedProfileFormValues>;
  isCooperativeMember: boolean;
};

export function BusinessInfoSection({
  control,
  errors,
  isCooperativeMember,
}: BusinessInfoSectionProps) {
  return (
    <ProfileFormSection
      title="Ubucuruzi"
      description="Amakuru ajyanye n'ubumuga n'ubunyamuryango."
    >
      <BooleanSelectField
        control={control}
        name="is_pwd"
        label="Ubana n'ubumuga ?"
      />

      <BooleanSelectField
        control={control}
        name="is_cooperative_member"
        label="Uri mu koperative?"
      />

      {isCooperativeMember ? (
        <ControlledInput
          control={control}
          name="cooperative_name"
          label="Izina ry'akoperative"
          errorMessage={errors.cooperative_name?.message}
        />
      ) : null}
    </ProfileFormSection>
  );
}
