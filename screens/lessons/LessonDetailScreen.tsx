import Button from '@/components/buttons/button';
import IconButton from '@/components/buttons/iconButton';
import PlayAudioButton from '@/components/buttons/playAudioButton';
import ChapterCard from '@/components/cards/ChapterCard';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import { LessonCardSkeleton } from '@/components/skeletons';
import { ThemedView } from '@/components/themed-view';
import { TextBody, TextHeading } from '@/components/typography';
import { useLessonByDocumentId } from '@/hooks/useLessons';
import { StrapiLessonChapter } from '@/types/api';
import { getImageUrl } from '@/utils/functions/env';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { LegendList, LegendListRef, LegendListRenderItemProps, } from '@legendapp/list';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { scale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatedLegendList } from '@legendapp/list/reanimated';
import { Image, ImageBackground, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, StyleSheet, View } from 'react-native';
import Loader from '@/components/loader';

export const CHAPTER_CARD_WIDTH = (Dimensions.SCREEN_WIDTH - themeToken.spacingLg * 2) * 0.8;
export const CHAPTER_CARD_SPACING = Dimensions.SIZE_M;
export const CHAPTER_SNAP_INTERVAL = CHAPTER_CARD_WIDTH + CHAPTER_CARD_SPACING;
export const DEFAULT_LIST_HEIGHT = Dimensions.SCREEN_HEIGHT - (Dimensions.SIZE_M * 5)

const LessonDetailScreen = () => {
  const [loadedLayouts, setLoadedLayouts] = useState(0);
  const chapterListRef = useRef<LegendListRef | null>(null);
  const params = useLocalSearchParams<{ lessonId: string }>();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [listHeight, setListHeight] = useState(DEFAULT_LIST_HEIGHT);
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';
  const { lesson, isLoading, isRefetching, error, lessonChapters, refetch } = useLessonByDocumentId(lessonId);

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefetching} onRefresh={refetch} />,
    [isRefetching, refetch]
  );

  const renderChapter = ({ item }: LegendListRenderItemProps<StrapiLessonChapter>) => (
    <ChapterCard
      height={listHeight}
      chapterId={item.documentId}
      onPress={() => router.push(`/lessons/chapters/${item.documentId}?lessonId=${lessonId}`)}
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
    if (!event.nativeEvent?.layout.height) return;
    setLoadedLayouts(prev => prev + 1);
    setListHeight(prev => prev - (event.nativeEvent?.layout.height ?? 100));
  }, []);

  const getBackButtonColor = useMemo(() => {
    if (activeChapterIndex === 0) return { color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary };
    return { color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [activeChapterIndex]);

  const getNextButtonColor = useMemo(() => {
    if (activeChapterIndex >= lessonChapters.length - 1) return { color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary };
    return { color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [activeChapterIndex, lessonChapters.length]);

  if (!lessonId) {
    return (
      <ThemedView style={styles.container}>
        <EmptyListWithSkeleton
          title="Lesson not found."
          description="Please go back and choose a lesson to continue."
        />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <EmptyListWithSkeleton
          title="Failed to load lesson chapters."
          description="Check your connection and try again."
          action={{ label: 'Retry', onPress: refetch }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView onLayout={onLayout} edges={['top']} style={[globalStyles.bg_primary_light, globalStyles.p_md, globalStyles.gap_sm]}>
        <StatusBar style="dark" backgroundColor={colors.primary} />
        <View>
          <View style={flexBetween}>
            <IconButton onPress={router.back} icon="chevron-left" iconType="feather" backgroundColor={colors.primary_light} iconFill={colors.primary} />
            <PlayAudioButton audioUrl={lesson?.audio_desc?.url} />
          </View>
          <ImageBackground source={{ uri: getImageUrl(lesson?.thumbnail?.url) }} style={styles.thumbnailBackground} />
          <View style={[flexBetween, globalStyles.gap_sm, globalStyles.mt_sm]}>
            <Image resizeMode='contain' source={{ uri: getImageUrl(lesson?.thumbnail?.url) }} style={styles.thumbnail} />
            <View style={globalStyles.flex_1}>
              <TextBody variant="body2" color="primary" style={globalStyles.mt_xs}>
                Igice cya 1
              </TextBody>
              <TextHeading variant="title">{lesson?.title ?? 'Lesson'}</TextHeading>
            </View>
          </View>
        </View>
      </SafeAreaView>
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
                  title="No chapters found"
                  containerStyles={styles.emptyState}
                  description="This lesson does not have chapters yet."
                />
              )
            }
          />)
      }
      {lessonChapters.length > 1 ? (
        <View onLayout={onLayout} style={[flexBetween, globalStyles.px_md, globalStyles.py_lg]}>
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
            label='Ibikurikira'
            onPress={goToNextChapter}
            textStyles={globalStyles.w_auto}
            textColor={getNextButtonColor.color}
            disabled={activeChapterIndex >= lessonChapters.length - 1}
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
  thumbnail: {
    width: scale(60),
    height: scale(60),
  },
  thumbnailBackground: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_025,
  },
});
