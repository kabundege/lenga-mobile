import { TextBody } from '@/components/typography';
import { TextHeading } from '@/components/typography/textHeading';
import globalStyles from '@/utils/styles/globalstyles.style';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type ProfileFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function ProfileFormSection({ title, description, children }: ProfileFormSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <TextHeading variant="subTitle" color="primary">
          {title}
        </TextHeading>
        {description ? (
          <TextBody variant="caption" color="secondary">
            {description}
          </TextBody>
        ) : null}
      </View>

      <View style={globalStyles.gap_sm}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: themeToken.spacingSm,
    padding: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.primary_light,
  },
  header: {
    gap: themeToken.spacingSm,
    paddingBottom: themeToken.paddingSm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
});
