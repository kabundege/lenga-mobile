import { ThemedView } from '@/components/themed-view';
import { TextBody, TextHeading } from '@/components/typography';
import { globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

type EmptyTopicsMessageVariant = 'noTopics' | 'searchEmpty';

type EmptyTopicsMessageProps = {
  variant?: EmptyTopicsMessageVariant;
};

export function EmptyTopicsMessage({ variant = 'noTopics' }: EmptyTopicsMessageProps) {
  const { t } = useTranslation();
  const titleKey = variant === 'searchEmpty' ? 'courses.searchEmptyTitle' : 'courses.emptyTopicsTitle';
  const descriptionKey = variant === 'searchEmpty' ? 'courses.searchEmptyDescription' : 'courses.emptyTopicsDescription';
  return (
    <ThemedView style={[styles.container, globalStyles.center]}>
      <TextHeading variant="subTitle" style={[globalStyles.text_center, globalStyles.w_80]}>
        {t(titleKey)}
      </TextHeading>
      <TextBody
        variant="body2"
        color="secondary"
        style={[globalStyles.text_center, globalStyles.w_80, styles.description]}
      >
        {t(descriptionKey)}
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
