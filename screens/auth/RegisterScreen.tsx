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
    defaultValues: { username: '', email: '', password: '' },
  });

  const handleRegister = handleSubmit((data) => registerMutation.mutate(data));

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
              control={control}
              name="username"
              icon="account"
              label="Username"
              placeholder="Username"
              autoCapitalize="none"
              errorMessage={errors.username?.message}
            />
            <ControlledInput<RegisterFormValues>
              control={control}
              name="email"
              label="Imeyili"
              icon="email"
              placeholder="urugero@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={errors.email?.message}
            />
            <ControlledInput<RegisterFormValues>
              control={control}
              name="password"
              label="Ijambobanga"
              icon="lock-open"
              placeholder="********"
              secureTextEntry
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
            <LinkButton strong color="default">
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
