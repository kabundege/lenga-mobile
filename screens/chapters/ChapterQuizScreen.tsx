import colors from '@/utils/theme/colors';
import Button from '@/components/buttons/button';
import { themeToken } from '@/utils/theme/styles';
import { TextBody } from '@/components/typography';
import { getChapterVideoUrl } from './chapterVideo';
import { ThemedView } from '@/components/themed-view';
import QuizQACard from '@/components/cards/QuizQACard';
import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useChapterByDocumentId, useChapterMatchings, useChapterQuizzes, useChapterVideo } from '@/hooks/useLessons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyListWithSkeleton } from '@/components/empty-states';

const ChapterQuizScreen = () => {
  const [hasQuizRightAnswer, setHasQuizRightAnswer] = useState(false);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [pickedQaId, setPickedQaId] = useState('');
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ chapterId: string; lessonId?: string; quizId?: string }>();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : '';
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';
  const quizId = typeof params.quizId === 'string' ? params.quizId : '';

  const { chapter, isLoading: isChapterLoading, isRefetching: isChapterRefetching, error: chapterError, refetch: chapterRefetch } = useChapterByDocumentId(chapterId);
  const { chapterVideo, isLoading: isChapterVideoLoading, isRefetching: isChapterVideoRefetching, error: chapterVideoError, refetch: chapterVideoRefetch } =
    useChapterVideo(chapterId);
  const {
    chapterQuizzes,
    error: chapterQuizzesError,
    refetch: chapterQuizzesRefetch,
    isLoading: isChapterQuizzesLoading,
    isRefetching: isChapterQuizzesRefetching,
  } = useChapterQuizzes(chapterId);

  const { chapterMatchings } = useChapterMatchings(chapterId);

  const isLoading = isChapterLoading || isChapterVideoLoading || isChapterQuizzesLoading;
  const isRefetching = isChapterRefetching || isChapterVideoRefetching || isChapterQuizzesRefetching;
  const error = chapterError ?? chapterVideoError ?? chapterQuizzesError;

  const refetch = useCallback(() => {
    chapterRefetch();
    chapterVideoRefetch();
    chapterQuizzesRefetch();
  }, [chapterRefetch, chapterVideoRefetch, chapterQuizzesRefetch]);

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />,
    [isRefetching, refetch]
  );

  const activeQuiz = useMemo(() => chapterQuizzes[activeQuizIndex], [chapterQuizzes, activeQuizIndex]);
  const qas = useMemo(() => activeQuiz?.qas ?? [], [activeQuiz]);
  const videoUrl = useMemo(() => getChapterVideoUrl(chapterVideo ?? null), [chapterVideo]);
  const qasScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!quizId) return;
    const idx = chapterQuizzes.findIndex((q) => q.documentId === quizId);
    if (idx >= 0 && idx !== activeQuizIndex) setActiveQuizIndex(idx);
  }, [quizId, chapterQuizzes, activeQuizIndex]);

  useEffect(() => {
    setPickedQaId('');
    qasScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeQuizIndex]);

  const onPickQaId = useCallback((qaId: string) => setPickedQaId(qaId), []);

  const pushQuizByIndex = useCallback(
    (nextIndex: number) => {
      const nextQuiz = chapterQuizzes[nextIndex];
      if (!nextQuiz) return;
      setHasQuizRightAnswer(false);
      setActiveQuizIndex(nextIndex);
    },
    [chapterQuizzes, chapterId, lessonId]
  );

  const backButton = useMemo(() => {
    const isDisabled = activeQuizIndex <= 0;
    if (isDisabled) return { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary };
    return { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [activeQuizIndex]);

  const isLastQuiz = activeQuizIndex >= chapterQuizzes.length - 1;
  const hasMatchings = chapterMatchings.length > 0;

  const nextButton = useMemo(() => {
    const isDisabled = !hasQuizRightAnswer;
    if (isDisabled) return { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary };
    return { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [hasQuizRightAnswer]);

  const RenderQas = useCallback(() => {
    return qas.map((qa) => (
      <QuizQACard key={qa.documentId} qaId={qa.documentId} rightAnswerCallBack={() => setHasQuizRightAnswer(true)} />
    ));
  }, [qas, pickedQaId, onPickQaId]);

  if (!chapterId) return <ThemedView style={[styles.container, globalStyles.center]} />;

  if (error) {
    return (
      <ThemedView style={[styles.container, globalStyles.center]}>
        <TextBody variant="body2" strong>
          Ntibyashobotse gufungura igice.
        </TextBody>
        <Pressable onPress={refetch} style={globalStyles.mt_sm}>
          <TextBody variant="body2" color="primary">
            Ongera ugerageze
          </TextBody>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ContentThumbnailHeader
        onBack={router.back}
        title={activeQuiz?.title ?? chapter?.title ?? 'Igice'}
        subtitle={activeQuiz ? `Umwitozo wa ${activeQuizIndex + 1}` : undefined}
        thumbnailUrl={chapter?.thumbnail?.url}
        audioUrl={activeQuiz?.audio_desc?.url ?? chapter?.audio_desc?.url}
      />

      {qas.length ? (
        <ScrollView style={globalStyles.flex_1} contentContainerStyle={styles.grid} ref={qasScrollRef} refreshControl={refreshControl}>
          <RenderQas />
        </ScrollView>
      ) : !isLoading ? (
        <EmptyListWithSkeleton
          title={quizId ? 'Nta bibazo biboneka' : 'Nta myitozo iboneka'}
          description={quizId ? 'Nta bibazo biboneka muri uyu mwitozo.' : 'Nta myitozo iboneka muri iki gice.'}
          containerStyles={styles.emptyState}
        />
      ) : null}

      {chapterQuizzes.length > 1 || hasMatchings ? (
        <View style={[flexBetween, globalStyles.px_md, { paddingBottom: insets.bottom }]}>
          <Button
            size="sm"
            type="primary"
            label="Ibibanza"
            textStyles={globalStyles.w_auto}
            textColor={backButton.color}
            disabled={backButton.isDisabled}
            onPress={() => pushQuizByIndex(Math.max(0, activeQuizIndex - 1))}
            leftIcon={{ name: 'chevron-left', color: backButton.color }}
            overRiddingStyles={[globalStyles.w_40, backButton.bgStyles]}
          />
          <Button
            size="sm"
            type="primary"
            label={isLastQuiz ? (hasMatchings ? 'Guhuzanya' : 'Sohoka') : 'Ibikurikira'}
            textColor={nextButton.color}
            textStyles={globalStyles.w_auto}
            disabled={nextButton.isDisabled}
            overRiddingStyles={[globalStyles.w_40, nextButton.bgStyles]}
            rightIcon={{ name: 'chevron-right', color: nextButton.color }}
            onPress={() => {
              if (isLastQuiz) {
                if (hasMatchings) {
                  router.push({
                    pathname: '/lessons/chapters/[chapterId]/matching',
                    params: { chapterId, lessonId },
                  });
                } else {
                  router.back();
                }
                return;
              }
              pushQuizByIndex(Math.min(chapterQuizzes.length - 1, activeQuizIndex + 1));
            }}
          />
        </View>
      ) : null}
    </ThemedView>
  );
};

export default ChapterQuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  grid: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    ...globalStyles.py_md,
    justifyContent: 'center',
    rowGap: Dimensions.SIZE_XL,
  },
  quizCard: {
    borderWidth: 1,
    padding: themeToken.padding,
    marginTop: themeToken.spacingSm,
    borderColor: colors.border.primary,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.secondary,
  },
  emptyState: {
    paddingVertical: themeToken.paddingLg,
    alignItems: 'center',
  },
  videoCtaCard: {
    padding: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
});

