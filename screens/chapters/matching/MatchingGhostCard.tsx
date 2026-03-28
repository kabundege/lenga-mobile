import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Image } from 'react-native';
import { chapterMatchingStyles as styles } from './chapterMatchingStyles';

export type MatchingGhostCardProps = {
  thumbUri: string | null;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostVisible: SharedValue<boolean>;
};

export const MatchingGhostCard = ({
  thumbUri,
  ghostX,
  ghostY,
  ghostVisible,
}: MatchingGhostCardProps) => {
  const style = useAnimatedStyle(() => ({
    opacity: ghostVisible.value ? 0.9 : 0,
    transform: [{ translateX: ghostX.value }, { translateY: ghostY.value }],
    pointerEvents: 'none',
  }));

  const imgUri = useOfflineAssetUri(thumbUri);

  return (
    <Animated.View style={[styles.ghost, style]}>
      {imgUri ? (
        <Image source={{ uri: imgUri }} style={styles.ghostThumb} resizeMode="contain" />
      ) : null}
    </Animated.View>
  );
};
