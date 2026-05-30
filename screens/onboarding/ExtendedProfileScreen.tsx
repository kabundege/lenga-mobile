import Button from '@/components/buttons/button';
import WithKeyboardScrollView from '@/components/common/withKeyboardScrollView';
import { ControlledInput } from '@/components/inputs/ControlledInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography';
import { useSaveExtendedProfile } from '@/hooks/useAnalytics';
import type { Gender } from '@/types/analytics';
import { handleAxiosError } from '@/utils/error.util';
import globalStyles from '@/utils/styles/globalstyles.style';
import { centered } from '@/utils/styles/reusable.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import {
  extendedProfileSchema,
  GENDER_OPTIONS,
  type ExtendedProfileFormValues,
} from '@/utils/validations/extendedProfile';
import { yupResolver } from '@hookform/resolvers/yup';
import { router, type Href } from 'expo-router';
import type { Resolver } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

const GENDER_LABELS: Record<Gender, string> = {
  Male: 'Gabo',
  Female: 'Gore',
  Other: 'Ikindi',
  PreferNotToSay: 'Ntibishaka kuvugwa',
};

const BoolOption = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.optionChip, selected && styles.optionChipSelected]}
  >
    <TextBody variant="body2" color={selected ? 'default' : 'default'} style={selected ? styles.optionLabelSelected : undefined}>
      {label}
    </TextBody>
  </Pressable>
);

export default function ExtendedProfileScreen() {
  const saveProfile = useSaveExtendedProfile({
    onSuccess: () => router.replace('/lessons' as Href),
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExtendedProfileFormValues>({
    resolver: yupResolver(extendedProfileSchema) as Resolver<ExtendedProfileFormValues>,
    defaultValues: {
      gender: undefined,
      age: undefined,
      is_pwd: false,
      is_cooperative_member: false,
      cooperative_name: '',
      district: '',
      sector: '',
    },
  });

  const isCooperativeMember = watch('is_cooperative_member');

  const onSubmit = handleSubmit((values) => {
    saveProfile.mutate(
      {
        gender: values.gender,
        age: values.age,
        is_pwd: values.is_pwd,
        is_cooperative_member: values.is_cooperative_member,
        cooperative_name: values.is_cooperative_member ? values.cooperative_name : undefined,
        district: values.district,
        sector: values.sector,
      },
      { onError: handleAxiosError },
    );
  });

  return (
    <ThemedView style={globalStyles.flex_1}>
      <WithKeyboardScrollView style={styles.container}>
        <View style={[centered, globalStyles.mb_xl]}>
          <ThemedText type="title" style={globalStyles.text_center}>
            Umwirondoro
          </ThemedText>
          <TextBody variant="body2" color="secondary" style={globalStyles.text_center}>
            Uzuza amakuru yawe kugira ngo dusobanukirwe n&apos;ibyiza by&apos;amashuri.
          </TextBody>
        </View>

        <View style={globalStyles.gap_sm}>
          <TextBody variant="caption" strong>
            Igitsina
          </TextBody>
          <Controller
            control={control}
            name="gender"
            render={({ field: { value, onChange } }) => (
              <View style={styles.optionRow}>
                {GENDER_OPTIONS.map((option) => (
                  <BoolOption
                    key={option}
                    label={GENDER_LABELS[option]}
                    selected={value === option}
                    onPress={() => onChange(option)}
                  />
                ))}
              </View>
            )}
          />
          {errors.gender?.message ? (
            <TextBody variant="caption" color="danger">
              {errors.gender.message}
            </TextBody>
          ) : null}

          <ControlledInput
            control={control}
            name="age"
            label="Imyaka"
            keyboardType="number-pad"
            errorMessage={errors.age?.message}
          />

          <TextBody variant="caption" strong>
            Ufite ubumuga bwo kumva?
          </TextBody>
          <Controller
            control={control}
            name="is_pwd"
            render={({ field: { value, onChange } }) => (
              <View style={styles.optionRow}>
                <BoolOption label="Yego" selected={value === true} onPress={() => onChange(true)} />
                <BoolOption label="Oya" selected={value === false} onPress={() => onChange(false)} />
              </View>
            )}
          />

          <TextBody variant="caption" strong>
            Uri mu koperative?
          </TextBody>
          <Controller
            control={control}
            name="is_cooperative_member"
            render={({ field: { value, onChange } }) => (
              <View style={styles.optionRow}>
                <BoolOption label="Yego" selected={value === true} onPress={() => onChange(true)} />
                <BoolOption label="Oya" selected={value === false} onPress={() => onChange(false)} />
              </View>
            )}
          />

          {isCooperativeMember ? (
            <ControlledInput
              control={control}
              name="cooperative_name"
              label="Izina ry&apos;akoperative"
              errorMessage={errors.cooperative_name?.message}
            />
          ) : null}

          <ControlledInput
            control={control}
            name="district"
            label="Akarere"
            errorMessage={errors.district?.message}
          />

          <ControlledInput
            control={control}
            name="sector"
            label="Umurenge"
            errorMessage={errors.sector?.message}
          />
        </View>

        <Button
          type="primary"
          size="md"
          label="Bika umwirondoro"
          loading={saveProfile.isPending}
          onPress={() => {
            void onSubmit();
          }}
          overRiddingStyles={globalStyles.mt_xl}
        />
      </WithKeyboardScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: themeToken.paddingLg,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeToken.spacingSm,
  },
  optionChip: {
    paddingHorizontal: themeToken.paddingSm,
    paddingVertical: themeToken.paddingSm,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionLabelSelected: {
    color: colors.text.inverted,
  },
});
