import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/buttons/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography/textBody';
import { useAppSelector } from '@/hooks/useRedux';
import globalStyles from '@/utils/styles/globalstyles.style';
import { themeToken } from '@/utils/theme/styles';

export default function SplashScreen() {
  const jwt = useAppSelector((s) => s.auth.jwt);

  useEffect(() => {
    const t = setTimeout(() => {
      if (jwt) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }, 800);
    return () => clearTimeout(t);
  }, [jwt]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[globalStyles.text_primary, globalStyles.text_center]}>
        LENGA
      </ThemedText>
      <TextBody variant="body1" style={globalStyles.text_center}>
        Kanda kuri iyi button ufungure porogaramu ya lenga
      </TextBody>
      <Button
        type="primary"
        size="lg"
        label="Tangira"
        rounded
        overRiddingStyles={globalStyles.min_w_50}
        onPress={() => (jwt ? router.replace('/(tabs)') : router.replace('/login'))}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: themeToken.spacingLg,
    justifyContent: 'center',
    padding: themeToken.spacing,
  },
});
