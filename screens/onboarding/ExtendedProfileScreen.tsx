import { BusinessInfoSection } from "@/screens/onboarding/components/BusinessInfoSection";
import { ProfileFormHeader } from "@/screens/onboarding/components/ProfileFormHeader";
import { UserInfoSection } from "@/screens/onboarding/components/UserInfoSection";
import Button from "@/components/buttons/button";
import WithKeyboardScrollView from "@/components/common/withKeyboardScrollView";
import { useSaveExtendedProfile } from "@/hooks/useAnalytics";
import { handleAxiosError } from "@/utils/error.util";
import globalStyles from "@/utils/styles/globalstyles.style";
import { themeToken } from "@/utils/theme/styles";
import {
  extendedProfileSchema,
  type ExtendedProfileFormValues,
} from "@/utils/validations/extendedProfile";
import { yupResolver } from "@hookform/resolvers/yup";
import { router, type Href } from "expo-router";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { useAppDispatch } from "@/hooks/useRedux";
import { logout } from "@/store/slices/authSlice";

const ExtendedProfileScreen = () => {
  const dispatch = useAppDispatch();
  const saveProfile = useSaveExtendedProfile({
    onSuccess: () => router.replace("/lessons" as Href),
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExtendedProfileFormValues>({
    resolver: yupResolver(
      extendedProfileSchema,
    ) as Resolver<ExtendedProfileFormValues>,
    defaultValues: {
      is_cooperative_member: false,
      cooperative_name: "",
      gender: undefined,
      age: undefined,
      is_pwd: false,
      district: "",
      sector: "",
    },
  });

  const isCooperativeMember = watch("is_cooperative_member");

  const onSubmit = handleSubmit((values) => {
    saveProfile.mutate(
      {
        gender: values.gender,
        age: values.age,
        is_pwd: values.is_pwd,
        is_cooperative_member: values.is_cooperative_member,
        cooperative_name: values.is_cooperative_member
          ? values.cooperative_name
          : undefined,
        district: values.district,
        sector: values.sector,
      },
      { onError: handleAxiosError },
    );
  });

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/splash");
  };

  return (
    <WithKeyboardScrollView style={styles.container}>
      <ProfileFormHeader />

      <View style={styles.sections}>
        <UserInfoSection
          errors={errors}
          control={control}
          setValue={setValue}
        />

        <BusinessInfoSection
          control={control}
          errors={errors}
          isCooperativeMember={isCooperativeMember}
        />
      </View>

      <View style={[globalStyles.mt_xl, globalStyles.gap_sm]}>
        <Button
          size="md"
          type="primary"
          onPress={() => {
            void onSubmit();
          }}
          label="Emeza umwirondoro"
          loading={saveProfile.isPending}
        />
        <Button size="md" type="danger" label="Sohoka" onPress={handleLogout} />
      </View>
      <View style={globalStyles.hs_10} />
    </WithKeyboardScrollView>
  );
};

export default ExtendedProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: themeToken.paddingLg,
  },
  sections: {
    gap: themeToken.spacing,
  },
});
