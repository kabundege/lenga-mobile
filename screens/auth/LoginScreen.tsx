import Button from '@/components/buttons/button';
import LinkButton from '@/components/buttons/linkButton';
import WithKeyboardScrollView from '@/components/common/withKeyboardScrollView';
import { ControlledInput } from '@/components/inputs/ControlledInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography';
import { useLogin } from '@/hooks/useAuth';
import globalStyles from '@/utils/styles/globalstyles.style';
import { centered } from '@/utils/styles/reusable.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { loginSchema, type LoginFormValues } from '@/utils/validations/auth';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  const loginMutation = useLogin({
    onSuccess: () => router.replace('/(tabs)'),
  });

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const handleLogin = handleSubmit((data) => loginMutation.mutate(data));

  return (
    <ThemedView style={globalStyles.flex_1}>
      <WithKeyboardScrollView style={styles.container}>
        <View style={[centered, globalStyles.mb_xl]}>
          <ThemedText type="title" style={[globalStyles.text_primary, globalStyles.line_height_4xl]}>
            Injira
          </ThemedText>
          <TextBody variant="body1" color='tertiary' center>
            Kwinjira muri konti yawe urasabwa kwinjira emeyili yawe na pasiwadi (ijambobanga)
          </TextBody>
        </View>
        <View style={globalStyles.gap_xl}>
          <View style={globalStyles.gap_xs}>
            <ControlledInput<LoginFormValues>
              control={control}
              placeholder="urugero@mail.com"
              autoCapitalize="none"
              name="identifier"
              key="identifier"
              label="Imeyili"
              icon="email"
            />
            <ControlledInput<LoginFormValues>
              control={control}
              name="password"
              key="password"
              secureTextEntry
              icon="lock-open"
              label="Ijambobanga"
              placeholder="********"
            />
          </View>
          <View style={globalStyles.gap_sm}>
            <Button
              rounded
              size="lg"
              type="primary"
              label="Injira"
              onPress={() => handleLogin()}
              loading={loginMutation.isPending}
            />
            <View style={[centered, globalStyles.mx_lg]}>
              <View style={[globalStyles.border_t, globalStyles.border_tertiary, globalStyles.w_full, globalStyles.absolute, globalStyles.top_50]} />
              <TextBody center color='tertiary' style={[globalStyles.bg_white, globalStyles.px_xs]}> Nta konti ufite ?</TextBody>
            </View>
            <Button
              rounded
              size="md"
              type="secondary"
              label="Iyandikishe"
              textColor={colors.text.primary}
              onPress={() => router.push('/register')}
            />
          </View>
          <View style={centered}>
            <TextBody color='tertiary'>Nemeye ko nasomye kandi nemera</TextBody>
            <LinkButton strong color='default'>Amategeko n'amabwiriza</LinkButton>
          </View>
        </View>
      </WithKeyboardScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...globalStyles.pt_5xl,
    padding: themeToken.paddingLg,
  },
  form: {
    gap: 0,
  },
  submitBtn: {
    marginTop: themeToken.spacing,
  },
  registerBtn: {
    marginTop: themeToken.spacing,
  },
});
