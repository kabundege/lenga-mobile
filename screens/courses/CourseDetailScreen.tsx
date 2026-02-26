import Spacer from '@/components/common/spacer';
import { ThemedView } from '@/components/themed-view';
import { Dimensions, globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CourseDetailErrorState,
  CourseDetailHeader,
  CourseDetailHero,
  CourseDetailLoadingState,
  CourseNotFoundMessage,
  CourseTopicsList,
} from './components';
import { useCourseDetail } from './useCourseDetail';

const NOT_FOUND_MESSAGE = 'Isomo ntabwo ryabonetse.';

export default function CourseDetailScreen() {
  const {
    courseId,
    course,
    user,
    topics,
    isEnrolled,
    isLoading,
    isRefetching,
    error,
    refetch,
    enrollMutation,
    handleEnroll,
  } = useCourseDetail();

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefetching} onRefresh={refetch} />,
    [isRefetching, refetch]
  );

  if (!courseId) {
    return (
      <ThemedView style={[styles.centered, globalStyles.center]}>
        <CourseNotFoundMessage message={NOT_FOUND_MESSAGE} />
      </ThemedView>
    );
  }

  if (error) {
    return <CourseDetailErrorState onRetry={refetch} />;
  }

  if (isLoading && !course) {
    return <CourseDetailLoadingState />;
  }

  if (!course) {
    return (
      <ThemedView style={[styles.centered, globalStyles.center]}>
        <CourseNotFoundMessage
          message={NOT_FOUND_MESSAGE}
          messageStyle={globalStyles.w_80}
        />
      </ThemedView>
    );
  }

  const showEnrollButton = Boolean(user && !isEnrolled);

  return (
    <ThemedView style={[styles.container, globalStyles.bg_background]}>
      <SafeAreaView style={globalStyles.flex_1}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={refreshControl}
        >
          <CourseDetailHeader />
          <Spacer height={Dimensions.SPACING} />
          <CourseDetailHero
            course={course}
            showEnrollButton={showEnrollButton}
            isEnrolling={enrollMutation.isPending}
            onEnroll={handleEnroll}
          />
          <CourseTopicsList topics={topics} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: themeToken.paddingLg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeToken.paddingLg,
  },
});
