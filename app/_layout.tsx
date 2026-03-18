import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { AppProviders } from '@/components/providers/AppProviders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/translations/i18n';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { PressablesConfig } from 'pressto';

const PressablesProvider = ({ children }: { children: React.ReactNode }) => (
  <PressablesConfig
    animationType="spring"
    animationConfig={{ damping: 30, stiffness: 200 }}
    config={{ minScale: 0.9, activeOpacity: 0.6 }}
    globalHandlers={{
      onPress: () => {
        Haptics.selectionAsync();
      },
    }}
  >
    {children}
  </PressablesConfig>
);

const AppShell = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={globalStyles.flex_1}>
    <KeyboardProvider>
      <PressablesProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <BottomSheetModalProvider>
            <StatusBar style="light" backgroundColor={colors.primary} />
            {children}
            <Toaster position="bottom-center" />
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </PressablesProvider>
    </KeyboardProvider>
  </GestureHandlerRootView>
);

export const routes = {
  register: 'register',
  courses: 'courses',
  splash: 'splash',
  login: 'login',
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AppProviders>
      <AppShell>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName="splash" screenOptions={{ headerShown: false }}>
            {
              Object.entries(routes).map(([name]) => (
                <Stack.Screen key={name} name={name} />
              ))
            }
          </Stack>
        </ThemeProvider>
      </AppShell>
    </AppProviders>
  );
}
