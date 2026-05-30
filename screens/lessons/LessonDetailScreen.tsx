import Button from '@/components/buttons/button';
import ChapterCard from '@/components/cards/ChapterCard';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import { LessonCardSkeleton } from '@/components/skeletons';
import { ThemedView } from '@/components/themed-view';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';
import { useLessonByDocumentId } from '@/hooks/useLessons';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';
import { StrapiLessonChapter } from '@/types/api';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import Loader from '@/components/loader';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedLegendList } from '@legendapp/list/reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegendListRef, LegendListRenderItemProps } from '@legendapp/list';
import { CHAPTER_SNAP_INTERVAL, DEFAULT_LIST_HEIGHT } from './lessonLayout';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, StyleSheet, View } from 'react-native';

const LessonDetailScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loadedLayouts, setLoadedLayouts] = useState(0);
  const chapterListRef = useRef<LegendListRef | null>(null);
  const params = useLocalSearchParams<{ lessonId: string }>();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [listHeight, setListHeight] = useState(DEFAULT_LIST_HEIGHT);
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';
  const {
    lesson,
    isLoading,
    isRefetching,
    error,
    lessonChapters,
    refetch,
    lessonListPosition,
    lessonsTotal,
  } = useLessonByDocumentId(lessonId);
  const { recordLessonOpened } = useAnalyticsTracking();

  useEffect(() => {
    if (lesson) recordLessonOpened(lesson);
  }, [lesson, recordLessonOpened]);

  useEffect(() => {
    const max = Math.max(0, lessonChapters.length - 1);
    setActiveChapterIndex((i) => Math.min(i, max));
  }, [lessonChapters.length]);

  const lessonListSubtitle = useMemo(() => {
    if (lessonsTotal === 0 || lessonListPosition == null) return undefined;
    return t('lessons.lessonListSubtitle', {
      current: lessonListPosition,
      total: lessonsTotal,
    });
  }, [lessonsTotal, lessonListPosition, t]);

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefetching} onRefresh={refetch} />,
    [isRefetching, refetch]
  );

  const renderChapter = ({ item }: LegendListRenderItemProps<StrapiLessonChapter>) => (
    <ChapterCard
      height={listHeight}
      chapter={item}
    />
  );

  const scrollToChapterIndex = useCallback((nextIndex: number) => {
    chapterListRef.current?.scrollToOffset({
      offset: nextIndex * CHAPTER_SNAP_INTERVAL,
      animated: true,
    });
    setActiveChapterIndex(nextIndex);
  }, []);

  const goToPreviousChapter = useCallback(() => {
    if (activeChapterIndex === 0) return;
    scrollToChapterIndex(activeChapterIndex - 1);
  }, [activeChapterIndex, scrollToChapterIndex]);

  const goToNextChapter = useCallback(() => {
    if (activeChapterIndex >= lessonChapters.length - 1) return;
    scrollToChapterIndex(activeChapterIndex + 1);
  }, [activeChapterIndex, lessonChapters.length, scrollToChapterIndex]);

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / CHAPTER_SNAP_INTERVAL);
    setActiveChapterIndex(Math.max(0, Math.min(nextIndex, lessonChapters.length - 1)));
  }, [lessonChapters.length]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent?.layout.height;
    if (!height) return;
    setLoadedLayouts(prev => prev + 1);
    setListHeight(prev => prev - height);
  }, []);

  const getBackButtonColor = useMemo(() => {
    if (activeChapterIndex === 0) return { color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary };
    return { color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [activeChapterIndex]);

  const isLastChapter = activeChapterIndex >= lessonChapters.length - 1;

  const getNextButtonColor = useMemo(() => {
    return { color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, []);

  if (!lessonId) {
    return (
      <ThemedView style={styles.container}>
        <EmptyListWithSkeleton
          title="Isomo ntiryabonetse."
          description="Subira inyuma uhitemo isomo kugira ngo ukomeze."
        />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <EmptyListWithSkeleton
          title="Ntibyashobotse gufungura ibice by'isomo."
          description="Reba umurongo wa interineti wongere ugerageze."
          action={{ label: 'Ongera ugerageze', onPress: refetch }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.primary} />
      <View onLayout={onLayout}>
        <ContentThumbnailHeader
          onBack={router.back}
          title={lesson?.title ?? 'Isomo'}
          audioUrl={lesson?.audio_desc?.url}
          subtitle={lessonListSubtitle}
          thumbnailUrl={lesson?.thumbnail?.url}
        />
      </View>
      {
        loadedLayouts < 2 ? (
          <Loader />
        ) : (
          <AnimatedLegendList
            horizontal
            ref={chapterListRef}
            data={lessonChapters}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            renderItem={renderChapter}
            refreshControl={refreshControl}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CHAPTER_SNAP_INTERVAL}
            keyExtractor={(item) => item.documentId}
            onMomentumScrollEnd={onMomentumScrollEnd}
            contentContainerStyle={styles.carouselContent}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.loadingState}>
                  <View style={styles.loadingCard}>
                    <LessonCardSkeleton />
                  </View>
                  <View style={styles.loadingCard}>
                    <LessonCardSkeleton />
                  </View>
                </View>
              ) : (
                <EmptyListWithSkeleton
                  title="Nta bice byabonetse"
                  containerStyles={styles.emptyState}
                  description="Iri somo ntirirashyirwamo ibice."
                />
              )
            }
          />)
      }
      {lessonChapters.length > 0 ? (
        <View onLayout={onLayout} style={[flexBetween, globalStyles.px_md, { paddingBottom: insets.bottom }]}>
          <Button
            size='sm'
            type='primary'
            label='Ibibanza'
            onPress={goToPreviousChapter}
            textStyles={globalStyles.w_auto}
            disabled={activeChapterIndex === 0}
            textColor={getBackButtonColor.color}
            leftIcon={{ name: 'chevron-left', color: getBackButtonColor.color }}
            overRiddingStyles={[globalStyles.w_40, getBackButtonColor.bgStyles]}
          />
          <Button
            size='sm'
            type='primary'
            label={isLastChapter ? 'Sohoka' : 'Ibikurikira'}
            onPress={() => {
              if (isLastChapter) {
                router.back();
                return;
              }
              goToNextChapter();
            }}
            textStyles={globalStyles.w_auto}
            textColor={getNextButtonColor.color}
            overRiddingStyles={[globalStyles.w_40, getNextButtonColor.bgStyles]}
            rightIcon={{ name: 'chevron-right', color: getNextButtonColor.color }}
          />
        </View>
      ) : null}
    </ThemedView>
  );
};

export default LessonDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  carouselContent: {
    ...globalStyles.p_md,
    alignItems: 'stretch',
  },
  carouselSection: {
    flex: 1,
  },
  carouselControls: {
    ...globalStyles.p_md,
    ...globalStyles.pt_0,
    ...flexBetween,
  },
  emptyState: {
    width: Dimensions.SCREEN_WIDTH * 0.9,
  },
  loadingState: {
    flexDirection: 'row',
  },
  loadingCard: {
    width: 260,
    marginRight: themeToken.spacing,
    justifyContent: 'center',
  },
});
