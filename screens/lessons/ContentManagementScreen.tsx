import Button from '@/components/buttons/button';
import IconButton from '@/components/buttons/iconButton';
import { ThemedView } from '@/components/themed-view';
import { TextBody, TextHeading } from '@/components/typography';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useLessons } from '@/hooks/useLessons';
import {
  useChapters,
  useMatchings,
  useMatchingQuestions,
  useQAs,
  useQuizzes,
  useVideos,
} from '@/hooks/useLessons';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import type { StrapiLesson, StrapiLessonChapter, StrapiQuiz } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import {
  collectAllMediaForLesson,
  collectChapterNonQuizMedia,
  collectQuizSubtreeMedia,
  countOfflineProgress,
} from '@/utils/offlineMediaInventory';
import {
  downloadChapterAssets,
  downloadLessonAssets,
  downloadQuizAssets,
} from '@/store/slices/offlineContentSlice';
import { selectLessonSyncEntry } from '@/store/slices/offlineAssetsSlice';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

type ContentRow =
  | { kind: 'lesson'; lesson: StrapiLesson; urls: string[] }
  | { kind: 'chapter'; lesson: StrapiLesson; chapter: StrapiLessonChapter; urls: string[] }
  | {
      kind: 'quiz';
      lesson: StrapiLesson;
      chapter: StrapiLessonChapter;
      quiz: StrapiQuiz;
      urls: string[];
    };

const ContentManagementScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const locale = useAppSelector((s) => s.preferences.locale);
  const byRemoteUrl = useAppSelector((s) => s.offlineAssets.byRemoteUrl);

  const { lessons, isLoading, isRefetching, refetch } = useLessons();
  const { chapters } = useChapters();
  const { videos } = useVideos();
  const { quizzes } = useQuizzes();
  const { qas } = useQAs();
  const { matchings } = useMatchings();
  const { matchingQuestions } = useMatchingQuestions();

  const { refreshAllLessonOfflineData, isSyncing } = useOfflineSync();

  const [rowLoadingKey, setRowLoadingKey] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  const sections = useMemo(() => {
    const sortedLessons = lessons.slice().sort((a, b) => a.order - b.order);
    return sortedLessons.map((lesson) => {
      const chapterRefs = (lesson.lesson_chapters ?? []).slice().sort((a, b) => a.order - b.order);
      const resolvedChapters: StrapiLessonChapter[] = chapterRefs.map((ref) => {
        const rich = chapters.find((c) => c.documentId === ref.documentId);
        return rich ?? ref;
      });

      const rows: ContentRow[] = [];

      rows.push({
        kind: 'lesson',
        lesson,
        urls: collectAllMediaForLesson(
          lesson,
          chapters,
          videos,
          quizzes,
          qas,
          matchings,
          matchingQuestions,
        ),
      });

      for (const chapter of resolvedChapters) {
        const video = videos.find(
          (v) => v.lesson_chapter?.documentId === chapter.documentId,
        );
        rows.push({
          kind: 'chapter',
          lesson,
          chapter,
          urls: collectChapterNonQuizMedia(chapter, video, matchings, matchingQuestions),
        });

        const chapterQuizzes = quizzes
          .filter((q) => q.lesson_chapter?.documentId === chapter.documentId)
          .slice()
          .sort((a, b) => a.order - b.order);

        for (const quiz of chapterQuizzes) {
          rows.push({
            kind: 'quiz',
            lesson,
            chapter,
            quiz,
            urls: collectQuizSubtreeMedia(
              quiz,
              qas.filter((qa) => qa.quiz?.documentId === quiz.documentId),
            ),
          });
        }
      }

      return { lesson, rows };
    });
  }, [lessons, chapters, videos, quizzes, qas, matchings, matchingQuestions]);

  const onRefreshAll = useCallback(async () => {
    setRefreshingAll(true);
    try {
      const ok = await refreshAllLessonOfflineData();
      if (!ok) {
        await refetch();
      }
    } finally {
      setRefreshingAll(false);
    }
  }, [refetch, refreshAllLessonOfflineData]);

  const makeRowKey = useCallback((row: ContentRow) => {
    if (row.kind === 'lesson') return `lesson-${row.lesson.documentId}`;
    if (row.kind === 'chapter') return `chapter-${row.chapter.documentId}`;
    return `quiz-${row.quiz.documentId}`;
  }, []);

  const handlePreview = useCallback((row: ContentRow) => {
    if (row.kind === 'lesson') {
      router.push(`/lessons/${row.lesson.documentId}`);
      return;
    }
    if (row.kind === 'chapter') {
      router.push(`/lessons/chapters/${row.chapter.documentId}/video`);
      return;
    }
    router.push(`/lessons/chapters/${row.chapter.documentId}/quiz`);
  }, []);

  const handleRetry = useCallback(
    async (row: ContentRow) => {
      const key = makeRowKey(row);
      setRowLoadingKey(key);
      try {
        if (row.kind === 'lesson') {
          await dispatch(
            downloadLessonAssets({
              lessonId: row.lesson.documentId,
              queryClient,
              locale,
            }),
          ).unwrap();
        } else if (row.kind === 'chapter') {
          await dispatch(
            downloadChapterAssets({
              lessonId: row.lesson.documentId,
              chapterDocumentId: row.chapter.documentId,
              queryClient,
              locale,
            }),
          ).unwrap();
        } else {
          await dispatch(
            downloadQuizAssets({
              lessonId: row.lesson.documentId,
              quizDocumentId: row.quiz.documentId,
              queryClient,
              locale,
            }),
          ).unwrap();
        }
      } catch {
        toast.error(t('lessons.contentManagement.retryFailed'));
      } finally {
        setRowLoadingKey(null);
      }
    },
    [dispatch, locale, makeRowKey, queryClient, t],
  );

  if (isLoading && lessons.length === 0) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      <View style={[flexBetween, styles.header, { paddingTop: insets.top + themeToken.spacing }]}>
        <IconButton
          size="sm"
          icon="chevron-left"
          onPress={() => router.back()}
          backgroundColor={colors.primary_light}
          iconFill={colors.text.primary}
          style={globalStyles.rounded_sm}
        />
        <TextHeading variant="title" numberOfLines={1} style={styles.headerTitle}>
          {t('lessons.contentManagement.title')}
        </TextHeading>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.toolbar}>
        <Button
          type="outlined"
          size="sm"
          label={t('lessons.contentManagement.refreshAll')}
          loading={refreshingAll || isSyncing}
          onPress={() => onRefreshAll().catch(() => null)}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + themeToken.paddingLg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || refreshingAll}
            onRefresh={() => onRefreshAll().catch(() => null)}
          />
        }
      >
        {sections.map((section) => (
          <LessonSection
            key={section.lesson.documentId}
            section={section}
            byRemoteUrl={byRemoteUrl}
            rowLoadingKey={rowLoadingKey}
            makeRowKey={makeRowKey}
            onPreview={handlePreview}
            onRetry={handleRetry}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
};

function LessonSection({
  section,
  byRemoteUrl,
  rowLoadingKey,
  makeRowKey,
  onPreview,
  onRetry,
}: {
  section: { lesson: StrapiLesson; rows: ContentRow[] };
  byRemoteUrl: Record<string, string>;
  rowLoadingKey: string | null;
  makeRowKey: (row: ContentRow) => string;
  onPreview: (row: ContentRow) => void;
  onRetry: (row: ContentRow) => void;
}) {

  const syncEntry = useAppSelector(selectLessonSyncEntry(section.lesson.documentId));
  const lessonBusy =
    syncEntry?.status === 'downloading' || syncEntry?.status === 'queued';

  return (
    <View style={styles.section}>
      <TextHeading variant="subTitle" color="primary" style={styles.sectionTitle}>
        {section.lesson.title}
      </TextHeading>
      {section.rows.map((row) => (
        <ContentRowView
          key={makeRowKey(row)}
          row={row}
          byRemoteUrl={byRemoteUrl}
          globalLessonBusy={lessonBusy && row.kind === 'lesson'}
          selfLoading={rowLoadingKey === makeRowKey(row)}
          onPreview={() => onPreview(row)}
          onRetry={() => onRetry(row)}
        />
      ))}
    </View>
  );
}

function ContentRowView({
  row,
  byRemoteUrl,
  globalLessonBusy,
  selfLoading,
  onPreview,
  onRetry,
}: {
  row: ContentRow;
  byRemoteUrl: Record<string, string>;
  globalLessonBusy: boolean;
  selfLoading: boolean;
  onPreview: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const { downloaded, total } = countOfflineProgress(row.urls, byRemoteUrl);
  const needsRetry = total > 0 && downloaded < total;
  const isRowLoading = selfLoading || globalLessonBusy;

  const kindLabel =
    row.kind === 'lesson'
      ? t('lessons.contentManagement.lesson')
      : row.kind === 'chapter'
        ? t('lessons.contentManagement.chapter')
        : t('lessons.contentManagement.quiz');

  const title =
    row.kind === 'quiz'
      ? row.quiz.title?.trim() ||
        t('lessons.contentManagement.quizNumber', { order: row.quiz.order })
      : row.kind === 'chapter'
        ? row.chapter.title?.trim() ||
          t('lessons.contentManagement.chapterNumber', { order: row.chapter.order })
        : row.lesson.title;

  const progressLabel =
    total === 0
      ? t('lessons.contentManagement.noMedia')
      : downloaded >= total
        ? t('lessons.contentManagement.complete')
        : t('lessons.contentManagement.progress', { downloaded, total });

  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <View style={styles.rowText}>
          <TextBody variant="caption" color="tertiary">
            {kindLabel}
          </TextBody>
          <TextBody variant="body2" strong numberOfLines={2}>
            {title}
          </TextBody>
          <TextBody variant="caption" color="secondary">
            {progressLabel}
          </TextBody>
        </View>
        <View style={styles.rowActions}>
          {isRowLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Button
                type="tertiary"
                size="xs"
                label={t('lessons.contentManagement.preview')}
                onPress={onPreview}
              />
              {needsRetry ? (
                <Button
                  type="primary"
                  size="xs"
                  label={t('lessons.contentManagement.retryDownload')}
                  onPress={onRetry}
                />
              ) : null}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: themeToken.paddingLg,
    paddingBottom: themeToken.spacing,
    gap: themeToken.spacing,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.default.tertiary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  toolbar: {
    paddingHorizontal: themeToken.paddingLg,
    paddingVertical: themeToken.spacing,
  },
  scrollContent: {
    paddingHorizontal: themeToken.paddingLg,
    gap: themeToken.spacing,
  },
  section: {
    marginBottom: themeToken.spacing,
  },
  sectionTitle: {
    marginBottom: themeToken.spacing,
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.default.tertiary,
    borderRadius: themeToken.borderRadius,
    padding: themeToken.padding,
    marginBottom: themeToken.spacing,
    backgroundColor: colors.background.secondary,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: themeToken.spacing,
  },
  rowText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: themeToken.spacing,
    paddingRight: themeToken.spacing,
  },
  rowActions: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: themeToken.spacing,
    maxWidth: '42%',
  },
});

export default ContentManagementScreen;