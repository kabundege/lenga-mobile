import PlayAudioButton from '@/components/buttons/playAudioButton';
import ThumbnailWithOverlay from '@/components/common/ThumbnailWithOverlay';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { useAppSelector } from '@/hooks/useRedux';
import type { StrapiLesson } from '@/types/api';
import { selectLessonSyncEntry } from '@/store/slices/offlineAssetsSlice';
import { Dimensions, flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { TextBody, TextHeading } from '../typography';

interface LessonCardProps {
  index: number;
  lesson: StrapiLesson;
  style?: StyleProp<ViewStyle>;
}

const LessonCard = ({ index, lesson, style }: LessonCardProps) => {
  const thumbnailUrl = useOfflineAssetUri(lesson.thumbnail?.url);
  const syncEntry = useAppSelector(selectLessonSyncEntry(lesson.documentId));
  const isSyncing = syncEntry?.status === 'downloading' || syncEntry?.status === 'queued';
  const progress = syncEntry && syncEntry.totalAssets > 0
    ? Math.round((syncEntry.downloadedAssets / syncEntry.totalAssets) * 100)
    : 0;

  const stylesAnimated = useAnimatedStyle(() => ({
    marginLeft: withTiming(index % 2 === 0 ? 0 : cardSpacing),
  }));

  return (
    <PressableScale
      entering={FadeInDown.delay(index * 100)}
      style={[styles.card, stylesAnimated, style]}
      onPress={() => router.push(`/lessons/${lesson.documentId}`)}
    >
      <ThumbnailWithOverlay
        uri={thumbnailUrl}
        overlayStyle={styles.overlay}
        imageStyle={StyleSheet.absoluteFillObject}
      />

      {isSyncing ? (
        <View style={styles.syncOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <TextBody variant="caption" color="primary" strong>
            {syncEntry?.status === 'queued' ? 'Gutegereza...' : `${progress}%`}
          </TextBody>
        </View>
      ) : null}

      <View style={flexBetween}>
        <TextBody variant='body1' strong color='secondary'>Igice ya {index + 1}</TextBody>
        <PlayAudioButton
          audioUrl={lesson.audio_desc?.url}
        />
      </View>
      <View style={globalStyles.flex_1} />
      <TextHeading variant='subTitle'>{lesson.title}</TextHeading>
    </PressableScale>
  );
};

export default LessonCard;

const cardSpacing = themeToken.spacing;
const listPadding = themeToken.paddingLg * 2;
const cardWidth = (Dimensions.SCREEN_WIDTH - listPadding - cardSpacing) * 0.5;
const cardHeight = Dimensions.SCREEN_HEIGHT * 0.3;

const styles = StyleSheet.create({
  card: StyleSheet.flatten([
    globalStyles.p_md,
    globalStyles.rounded_md,
    globalStyles.overflow_hidden,
    globalStyles.overflow_hidden,
    globalStyles.border_secondary,
    {
      backgroundColor: colors.background.tertiary,
      width: cardWidth,
      height: cardHeight,
    },
  ]),
  overlay: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_05,
  },
  syncOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlays.white_80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
    borderRadius: themeToken.borderRadius,
  },
  savedBadge: {
    position: 'absolute',
    top: themeToken.paddingSm,
    right: themeToken.paddingSm,
    zIndex: 10,
    backgroundColor: colors.overlays.white_90,
    borderRadius: 12,
    padding: 2,
  },
});
