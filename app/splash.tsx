import { StyleSheet } from 'react-native';

import Button from '@/components/buttons/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography';
import globalStyles from '@/utils/styles/globalstyles.style';
import { themeToken } from '@/utils/theme/styles';
import { View } from 'react-native';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={globalStyles.gap_xs}>
        <ThemedText type="title" style={[globalStyles.text_primary, globalStyles.text_center]}>LENGA</ThemedText>
        <TextBody variant='body1'>Kanda kuri iyi button ufungure porogaramu ya lenga</TextBody>
      </View>
      <Button type="primary" size="lg" label="Tangira" rounded overRiddingStyles={globalStyles.min_w_50} />
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
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
