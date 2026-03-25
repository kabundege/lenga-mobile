import { ThemedView } from '@/components/themed-view';
import IconButton from '@/components/buttons/iconButton';
import QuizQACard, { QuizQACardRevealState } from '@/components/cards/QuizQACard';
import { TextBody, TextHeading } from '@/components/typography';
import { useLessonByDocumentId, useQuizByDocumentId } from '@/hooks/useLessons';
import type { StrapiLessonChapter, StrapiQA, StrapiQuiz } from '@/types/api';
import { API_URL } from '@/utils/functions/env';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Linking, ListRenderItemInfo, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getChapterVideoUrl(chapter: StrapiLessonChapter | null): string {
  const rawUrl = chapter?.lesson_video?.lesson_video?.url ?? '';
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
  return `${API_URL}${rawUrl}`;
}

const LessonChapterQuizVideoScreen = () => {
  const params = useLocalSearchParams<{ chapterId: string; lessonId: string; quizId?: string }>();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : '';
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';
  const quizId = typeof params.quizId === 'string' ? params.quizId : '';

  const { lesson, isLoading, isRefetching, error, refetch } = useLessonByDocumentId(lessonId);
  const chapter = useMemo(
    () => lesson?.lesson_chapters?.find((item) => item.documentId === chapterId) ?? null,
    [chapterId, lesson?.lesson_chapters]
  );
  const quizzes = chapter?.quizzes ?? [];
  const videoUrl = getChapterVideoUrl(chapter);
  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefetching} onRefresh={refetch} />,
    [isRefetching, refetch]
  );

  const quizFromChapter = useMemo(() => {
    if (!quizId) return null;
    return quizzes.find((q) => q.documentId === quizId) ?? null;
  }, [quizId, quizzes]);

  const quizRequest = useQuizByDocumentId(quizId);
  const activeQuiz = quizFromChapter ?? quizRequest.quiz ?? null;

  const qas = useMemo(() => (quizId ? activeQuiz?.qas ?? [] : []), [activeQuiz?.qas, quizId]);
  const [pickedQaId, setPickedQaId] = useState<string>('');

  const getQaRevealState = useCallback(
    (qa: StrapiQA): QuizQACardRevealState => {
      if (!pickedQaId || pickedQaId !== qa.documentId) return 'idle';
      const anyQa = qa as unknown as { is_correct?: boolean; isCorrect?: boolean };
      const isCorrect = typeof anyQa.is_correct === 'boolean' ? anyQa.is_correct : anyQa.isCorrect;
      if (typeof isCorrect !== 'boolean') return 'unknown';
      return isCorrect ? 'correct' : 'wrong';
    },
    [pickedQaId]
  );

  const renderQuiz = ({ item }: ListRenderItemInfo<StrapiQuiz>) => (
    <Pressable
      onPress={() => {
        setPickedQaId('');
        router.push(`/lessons/chapters/${chapterId}?lessonId=${lessonId}&quizId=${item.documentId}`);
      }}
      style={styles.quizCard}
    >
      <TextBody variant="body2" strong>
        {item.title}
      </TextBody>
      <TextBody variant="caption" color="secondary" style={globalStyles.mt_xs}>
        {(item.qas?.length ?? 0) > 0 ? `${item.qas?.length ?? 0} questions` : 'No questions found'}
      </TextBody>
    </Pressable>
  );

  const renderQa = ({ item }: ListRenderItemInfo<StrapiQA>) => (
    <QuizQACard
      qa={item}
      revealState={getQaRevealState(item)}
      onPress={() => setPickedQaId(item.documentId)}
    />
  );

  if (!chapterId || !lessonId) {
    return (
      <ThemedView style={[styles.container, globalStyles.center]} />
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, globalStyles.center]}>
        <TextBody variant="body2" strong>
          Failed to load chapter.
        </TextBody>
        <Pressable onPress={() => refetch()} style={globalStyles.mt_sm}>
          <TextBody variant="body2" color="primary">
            Retry
          </TextBody>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={[globalStyles.bg_primary_light, globalStyles.p_md, globalStyles.gap_sm]}>
        <View style={flexBetween}>
          <IconButton
            onPress={() => {
              if (quizId) {
                setPickedQaId('');
                router.replace(`/lessons/chapters/${chapterId}?lessonId=${lessonId}`);
                return;
              }
              router.back();
            }}
            icon="chevron-left"
            iconType="feather"
            backgroundColor={colors.primary_light}
          />
        </View>

        <View>
          <TextHeading variant="title">{chapter?.title ?? 'Chapter'}</TextHeading>
          <TextBody variant="body2" color="secondary" style={globalStyles.mt_xs}>
            {quizId ? 'Pick an answer to reveal correctness.' : 'Watch the lesson video and choose a quiz.'}
          </TextBody>

          {!quizId ? (
            <View style={styles.videoCard}>
              <TextBody variant="body2" strong>
                Lesson Video
              </TextBody>
              {videoUrl ? (
                <Pressable onPress={() => Linking.openURL(videoUrl)} style={styles.ctaButton}>
                  <TextBody variant="body2" color="inverted" strong>
                    Open Video
                  </TextBody>
                </Pressable>
              ) : (
                <TextBody variant="caption" color="secondary" style={globalStyles.mt_xs}>
                  No lesson video attached to this chapter.
                </TextBody>
              )}
            </View>
          ) : (
            <View style={styles.quizHeaderCard}>
              <TextHeading variant="subTitle">{activeQuiz?.title ?? 'Quiz'}</TextHeading>
              <TextBody variant="caption" color="secondary" style={globalStyles.mt_xs}>
                {(qas?.length ?? 0) > 0 ? `${qas.length} questions` : 'No questions available for this quiz.'}
              </TextBody>
            </View>
          )}

          <TextHeading variant="subTitle" style={globalStyles.mt_sm}>
            {quizId ? 'Questions' : 'Quizzes'}
          </TextHeading>
        </View>
      </SafeAreaView>

      <FlatList
        data={quizId ? qas : quizzes}
        renderItem={quizId ? (renderQa as unknown as (i: ListRenderItemInfo<StrapiQuiz | StrapiQA>) => JSX.Element) : (renderQuiz as unknown as (i: ListRenderItemInfo<StrapiQuiz | StrapiQA>) => JSX.Element)}
        refreshControl={refreshControl}
        contentContainerStyle={styles.content}
        keyExtractor={(item) => item.documentId}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <TextBody variant="body2" color="secondary">
                {quizId ? 'No questions available for this quiz.' : 'No quizzes available for this chapter.'}
              </TextBody>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
};

export default LessonChapterQuizVideoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: themeToken.paddingLg,
    paddingVertical: themeToken.paddingLg,
    gap: themeToken.spacing,
  },
  videoCard: {
    marginTop: themeToken.spacing,
    padding: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  quizHeaderCard: {
    marginTop: themeToken.spacing,
    padding: themeToken.padding,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  ctaButton: {
    marginTop: themeToken.spacing,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: themeToken.borderRadius,
    paddingHorizontal: themeToken.padding,
    paddingVertical: themeToken.paddingSm,
  },
  quizCard: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: themeToken.borderRadius,
    padding: themeToken.padding,
    backgroundColor: colors.background.secondary,
    marginTop: themeToken.spacingSm,
  },
  emptyState: {
    paddingVertical: themeToken.paddingLg,
    alignItems: 'center',
  },
});
