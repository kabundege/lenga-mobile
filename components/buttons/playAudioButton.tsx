import IconButton, { IconButtonProps } from "@/components/buttons/iconButton";
import { useLessonAudio } from "@/hooks/useLessonAudio";
import colors from "@/utils/theme/colors";
import { SizeVariants } from "@/utils/types/theme";
import { useEffect, useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface PlayAudioButtonProps extends Omit<
  IconButtonProps,
  "icon" | "iconType"
> {
  style?: StyleProp<ViewStyle>;
  size?: SizeVariants;
  audioUrl?: string;
}

const PlayAudioButton = ({
  style,
  audioUrl,
  size = "md",
  backgroundColor = colors.primary_light,
  ...iconButtonProps
}: PlayAudioButtonProps) => {
  const rotation = useSharedValue(0);
  const {
    audioLoaded,
    audioPlaying,
    playbackState,
    playbackBlockedOffline,
    toggleAudio,
  } = useLessonAudio(audioUrl);

  const showIdlePlaybackIcon =
    audioLoaded && !audioPlaying && playbackState === "idle";

  useEffect(() => {
    if (playbackBlockedOffline || audioLoaded) {
      rotation.value = 0;
      return;
    }

    rotation.value = withRepeat(
      withTiming(360, {
        duration: 900,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [audioLoaded, playbackBlockedOffline, rotation]);

  const loadingRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: audioLoaded ? 0 : 1,
  }));

  const iconType = useMemo(() => {
    if (playbackBlockedOffline) return "ionicons";
    if (audioPlaying) return "ionicons";
    if (showIdlePlaybackIcon) return "entypo";
    return "entypo";
  }, [playbackBlockedOffline, audioPlaying, showIdlePlaybackIcon]);

  const iconName = useMemo(() => {
    if (playbackBlockedOffline) return "cloud-offline-outline";
    if (audioPlaying) return "pause";
    if (showIdlePlaybackIcon) return "play-outline";
    return "sound";
  }, [playbackBlockedOffline, audioPlaying, showIdlePlaybackIcon]);

  if (!audioUrl) return null;

  return (
    <View style={[styles.wrapper, style]}>
      <IconButton
        size={size}
        onPress={toggleAudio}
        disabled={!audioLoaded || playbackBlockedOffline}
        iconFill={colors.primary}
        styles={iconButtonProps.styles}
        backgroundColor={backgroundColor}
        iconType={iconType}
        icon={iconName}
      />
      {!audioLoaded && !playbackBlockedOffline ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.loadingRing, loadingRingStyle]}
        />
      ) : null}
    </View>
  );
};

export default PlayAudioButton;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingRing: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderRadius: 21,
    position: "absolute",
    borderColor: colors.primary,
    borderTopColor: "transparent",
  },
});
