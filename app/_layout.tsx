import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { PressablesConfig } from 'pressto';

export const unstable_settings = {
  anchor: '(tabs)',
};

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
          <StatusBar style="light" backgroundColor={colors.background.primary} translucent={false} />
          {children}
        </SafeAreaProvider>
      </PressablesProvider>
    </KeyboardProvider>
  </GestureHandlerRootView>
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AppShell>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName='splash'>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AppShell>
  );
}
