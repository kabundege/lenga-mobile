import Button from '@/components/buttons/button';
import LinkButton from '@/components/buttons/linkButton';
import WithKeyboardScrollView from '@/components/common/withKeyboardScrollView';
import { ControlledInput } from '@/components/inputs/ControlledInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography';
import { useRegister } from '@/hooks/useAuth';
import globalStyles from '@/utils/styles/globalstyles.style';
import { centered } from '@/utils/styles/reusable.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { registerSchema, type RegisterFormValues } from '@/utils/validations/auth';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

export default function RegisterScreen() {
  const registerMutation = useRegister({
    onSuccess: () => router.replace('/login'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema) as Resolver<RegisterFormValues>,
    defaultValues: { username: '', phone: '', password: '' },
  });

  const handleRegister = handleSubmit((data) => {
    // comment this out for now
    const formattedEmail = data.username.split(' ').join('_').toLowerCase() + '@email.com';
    registerMutation.mutate({
      username: data.phone,
      email: formattedEmail,
      password: data.password,
    })
  });

  return (
    <ThemedView style={globalStyles.flex_1}>
      <WithKeyboardScrollView style={styles.container}>
        <View style={[centered, globalStyles.mb_xl]}>
          <ThemedText type="title" style={[globalStyles.text_primary, globalStyles.line_height_4xl]}>
            Iyandikishe
          </ThemedText>
          <TextBody variant="body1" color="tertiary" center>
            Cunga konti nshya kugira ngo ujye ufata inama z'imyigishirize
          </TextBody>
        </View>
        <View style={globalStyles.gap_xl}>
          <View style={globalStyles.gap_xs}>
            <ControlledInput<RegisterFormValues>
              icon="user"
              name="username"
              iconType='antd'
              label="Amazina"
              control={control}
              autoCapitalize="none"
              placeholder="andika hano"
              errorMessage={errors.username?.message}
            />
            <ControlledInput<RegisterFormValues>
              control={control}
              name="phone"
              icon="smartphone"
              iconType='feather'
              placeholder="07...."
              label="Nimero ya telefoni"
              keyboardType="email-address"
              errorMessage={errors.phone?.message}
            />
            <ControlledInput<RegisterFormValues>
              label="PIN"
              icon="lock"
              name="password"
              control={control}
              iconType='feather'
              placeholder="********"
              secureTextEntry
              keyboardType='phone-pad'
              onSubmitEditing={handleRegister}
              errorMessage={errors.password?.message}
            />
          </View>
          <View style={globalStyles.gap_sm}>
            <Button
              rounded
              size="lg"
              type="primary"
              label="Iyandikisha"
              onPress={() => handleRegister()}
              loading={registerMutation.isPending}
            />
            <View style={[centered, globalStyles.mx_lg]}>
              <View style={[globalStyles.border_t, globalStyles.border_tertiary, globalStyles.w_full, globalStyles.absolute, globalStyles.top_50]} />
              <TextBody center color="tertiary" style={[globalStyles.bg_white, globalStyles.px_xs]}>
                Ufite konti?
              </TextBody>
            </View>
            <Button
              rounded
              size="md"
              type="secondary"
              label="Subira ahabanza"
              textColor={colors.text.primary}
              onPress={() => router.back()}
            />
          </View>
          <View style={centered}>
            <TextBody color="tertiary">Nemeye ko nasomye kandi nemera</TextBody>
            <LinkButton strong color="default" onPress={() => router.push('/terms')}>
              Amategeko n'amabwiriza
            </LinkButton>
          </View>
        </View>
      </WithKeyboardScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...globalStyles.pt_3xl,
    padding: themeToken.paddingLg,
  },
});
