import { ThemedView } from '@/components/themed-view';
import { TextBody, TextHeading } from '@/components/typography';
import { globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import { StyleSheet } from 'react-native';

export function EmptyTopicsMessage() {
  return (
    <ThemedView style={[styles.container, globalStyles.center]}>
      <TextHeading variant="subTitle" style={[globalStyles.text_center, globalStyles.w_80]}>
        Nta bigice byabonetse
      </TextHeading>
      <TextBody
        variant="body2"
        color="secondary"
        style={[globalStyles.text_center, globalStyles.w_80, styles.description]}
      >
        Iyi somo nta bigice bifite kuri iki gihe. Reba vuba.
      </TextBody>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: themeToken.spacingLg * 2,
  },
  description: {
    marginTop: themeToken.spacingSm,
  },
});
