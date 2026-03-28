import Button from '@/components/buttons/button';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import ContentThumbnailHeader from '@/components/headers/ContentThumbnailHeader';
import { TextBody } from '@/components/typography';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { flexBetween, globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chapterMatchingStyles as styles } from './matching/chapterMatchingStyles';
import { MatchingGameBoard } from './matching/MatchingGameBoard';
import { MatchingGhostCard } from './matching/MatchingGhostCard';
import { useChapterMatchingScreen } from './matching/useChapterMatchingScreen';

const ChapterMatchingScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    chapterId,
    chapter,
    chapterMatchings,
    isLoading,
    error,
    refetch,
    activeMatching,
    activeMatchingIndex,
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
  } = useChapterMatchingScreen();

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
        title={activeMatching?.title ?? chapter?.title ?? 'Guhuzanya'}
        subtitle={activeMatching ? `Guhuzanya kwa ${activeMatchingIndex + 1}` : undefined}
        thumbnailUrl={chapter?.thumbnail?.url}
        audioUrl={activeMatching?.audio_desc?.url ?? chapter?.audio_desc?.url}
      />

      {activeMatching ? (
        <ScrollView
          ref={scrollRef}
          style={globalStyles.flex_1}
          contentContainerStyle={styles.content}
        >
          <MatchingGameBoard
            key={activeMatching.documentId}
            matchingId={activeMatching.documentId}
            onAllMatched={() => setAllMatchedForCurrent(true)}
            ghostX={ghostX}
            ghostY={ghostY}
            ghostVisible={ghostVisible}
            onDragStartGhost={handleDragStartGhost}
            onDragEndGhost={handleDragEndGhost}
          />
        </ScrollView>
      ) : !isLoading ? (
        <EmptyListWithSkeleton
          title="Nta guhuzanya biboneka"
          description="Nta guhuzanya biboneka muri iki gice."
          containerStyles={styles.emptyState}
        />
      ) : null}

      <MatchingGhostCard
        thumbUri={ghostThumb}
        ghostX={ghostX}
        ghostY={ghostY}
        ghostVisible={ghostVisible}
      />

      {chapterMatchings.length > 0 ? (
        <View
          style={[
            flexBetween,
            globalStyles.px_md,
            { paddingBottom: insets.bottom + themeToken.paddingSm },
          ]}
        >
          <Button
            size="sm"
            type="primary"
            label="Ibibanza"
            textStyles={globalStyles.w_auto}
            textColor={backButton.color}
            disabled={backButton.isDisabled}
            onPress={() => pushMatchingByIndex(Math.max(0, activeMatchingIndex - 1))}
            leftIcon={{ name: 'chevron-left', color: backButton.color }}
            overRiddingStyles={[globalStyles.w_40, backButton.bgStyles]}
          />
          <Button
            size="sm"
            type="primary"
            label={isLastMatching ? 'Sohoka' : 'Ibikurikira'}
            textColor={nextButton.color}
            textStyles={globalStyles.w_auto}
            disabled={nextButton.isDisabled}
            overRiddingStyles={[globalStyles.w_40, nextButton.bgStyles]}
            rightIcon={{ name: 'chevron-right', color: nextButton.color }}
            onPress={() => {
              if (isLastMatching) {
                router.back();
                return;
              }
              pushMatchingByIndex(Math.min(chapterMatchings.length - 1, activeMatchingIndex + 1));
            }}
          />
        </View>
      ) : null}
    </ThemedView>
  );
};

export default ChapterMatchingScreen;
