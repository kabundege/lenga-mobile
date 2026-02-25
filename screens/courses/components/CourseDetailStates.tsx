import Button from '@/components/buttons/button';
import { CourseDetailSkeleton } from '@/components/skeletons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseDetailHeader } from './CourseDetailHeader';

const centeredStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeToken.paddingLg,
  },
});

type NotFoundMessageProps = {
  message: string;
  messageStyle?: object;
};

export function CourseNotFoundMessage({ message, messageStyle }: NotFoundMessageProps) {
  return (
    <ThemedView style={[centeredStyles.centered, globalStyles.center]}>
      <ThemedText type="defaultSemiBold" style={[globalStyles.text_center, messageStyle]}>
        {message}
      </ThemedText>
    </ThemedView>
  );
}

export function CourseDetailErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ThemedView style={globalStyles.flex_1}>
      <SafeAreaView style={[globalStyles.flex_1, globalStyles.p_lg]}>
        <CourseDetailHeader />
        <View style={[centeredStyles.centered, globalStyles.center]}>
          <ThemedText type="defaultSemiBold" style={globalStyles.text_center}>
            Hari ikitagenze neza mu kubona isomo.
          </ThemedText>
          <Button
            type="light"
            overRiddingStyles={[[globalStyles.border_none, globalStyles.bg_transparent]]}
            size="lg"
            label="Subiramo"
            onPress={onRetry}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

export function CourseDetailLoadingState() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={globalStyles.flex_1}>
        <CourseDetailSkeleton />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
