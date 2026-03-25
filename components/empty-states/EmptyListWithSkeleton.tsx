import Button from '@/components/buttons/button';
import { LessonCardSkeleton } from '@/components/skeletons';
import { TextBody, TextHeading } from '@/components/typography';
import { globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import { StyleSheet, View } from 'react-native';

export type EmptyListWithSkeletonProps = {
  title?: string;
  description?: string;
  action?: { label: string; onPress: () => void };
  containerStyles?: object;
};

export const EmptyListWithSkeleton = ({
  title,
  description,
  action,
  containerStyles,
}: EmptyListWithSkeletonProps) => {
  return (
    <View style={[styles.container, containerStyles]}>
      <View style={styles.skeletonWrapper}>
        <LessonCardSkeleton />
      </View>
      {(title || description) && (
        <View>
          {title && (
            <TextHeading
              variant="subTitle"
              style={[globalStyles.text_center, globalStyles.w_70, globalStyles.self_center]}
              numberOfLines={2}
            >
              {title}
            </TextHeading>
          )}
          {description && (
            <TextBody
              variant="body2"
              color="secondary"
              style={[globalStyles.text_center, globalStyles.w_70, globalStyles.self_center]}
              numberOfLines={3}
            >
              {description}
            </TextBody>
          )}
        </View>
      )}
      {action && (
        <View style={styles.action}>
          <Button
            type="primary"
            size="md"
            label={action.label}
            onPress={action.onPress}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeToken.paddingLg,
    paddingTop: themeToken.spacingLg * 2,
  },
  skeletonWrapper: {
    opacity: 0.5,
    width: '100%',
    marginBottom: themeToken.spacingLg,
  },
  action: {
    marginTop: themeToken.spacingSm,
  },
});
