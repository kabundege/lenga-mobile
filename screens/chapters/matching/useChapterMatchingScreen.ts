import {
  useChapterByDocumentId,
  useChapterMatchings,
} from '@/hooks/useLessons';
import colors from '@/utils/theme/colors';
import { ScrollView } from 'react-native';
import { globalStyles } from '@/utils/styles';
import { useLocalSearchParams } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';


export function useChapterMatchingScreen() {
  const [activeMatchingIndex, setActiveMatchingIndex] = useState(0);
  const [allMatchedForCurrent, setAllMatchedForCurrent] = useState(false);
  const [ghostThumb, setGhostThumb] = useState<string | null>(null);

  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostVisible = useSharedValue(false);

  const handleDragStartGhost = useCallback((thumbUri: string | null) => {
    setGhostThumb(thumbUri);
  }, []);

  const handleDragEndGhost = useCallback(() => {
    setGhostThumb(null);
  }, []);

  const params = useLocalSearchParams<{
    chapterId: string;
    lessonId?: string;
    matchingId?: string;
  }>();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : '';
  const matchingId = typeof params.matchingId === 'string' ? params.matchingId : '';

  const {
    chapter,
    error: chapterError,
    refetch: chapterRefetch,
    isLoading: isChapterLoading,
  } = useChapterByDocumentId(chapterId);

  const {
    chapterMatchings,
    isLoading: isMatchingsLoading,
    error: matchingsError,
    refetch: matchingsRefetch,
  } = useChapterMatchings(chapterId);

  const isLoading = isChapterLoading || isMatchingsLoading;
  const error = chapterError ?? matchingsError;

  const refetch = useCallback(() => {
    chapterRefetch();
    matchingsRefetch();
  }, [chapterRefetch, matchingsRefetch]);

  const activeMatching = useMemo(
    () => chapterMatchings[activeMatchingIndex],
    [chapterMatchings, activeMatchingIndex]
  );

  useEffect(() => {
    if (!matchingId) return;
    const idx = chapterMatchings.findIndex((m) => m.documentId === matchingId);
    if (idx >= 0 && idx !== activeMatchingIndex) setActiveMatchingIndex(idx);
  }, [matchingId, chapterMatchings, activeMatchingIndex]);

  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    setAllMatchedForCurrent(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeMatchingIndex]);

  const pushMatchingByIndex = useCallback(
    (nextIndex: number) => {
      const next = chapterMatchings[nextIndex];
      if (!next) return;
      setAllMatchedForCurrent(false);
      setActiveMatchingIndex(nextIndex);
    },
    [chapterMatchings]
  );

  const isLastMatching = activeMatchingIndex >= chapterMatchings.length - 1;

  const backButton = useMemo(() => {
    const isDisabled = activeMatchingIndex <= 0;
    return isDisabled
      ? { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary }
      : { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [activeMatchingIndex]);

  const nextButton = useMemo(() => {
    const isDisabled = !allMatchedForCurrent;
    return isDisabled
      ? { isDisabled, color: colors.text.tertiary, bgStyles: globalStyles.bg_tertiary }
      : { isDisabled, color: colors.text.default, bgStyles: globalStyles.bg_primary_light };
  }, [allMatchedForCurrent]);

  return {
    chapterId,
    chapter,
    chapterMatchings,
    isLoading,
    error,
    refetch,
    activeMatching,
    activeMatchingIndex,
    allMatchedForCurrent,
    setAllMatchedForCurrent,
    scrollRef,
    pushMatchingByIndex,
    isLastMatching,
    backButton,
    nextButton,
    ghostThumb,
    ghostX,
    ghostY,
    ghostVisible,
    handleDragStartGhost,
    handleDragEndGhost,
  };
}
