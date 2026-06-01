import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, type Href } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { themeToken } from "@/utils/theme/styles";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TextBody } from "@/components/typography/textBody";
import globalStyles from "@/utils/styles/globalstyles.style";
import { resolvePostAuthRoute } from "@/services/analytics.service";
import { logout } from "@/store/slices/authSlice";
import { isValidToken } from "@/utils/functions/jwt";
import Animated, {
  BounceIn,
  BounceOut,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(ThemedText);
const AnimatedBody = Animated.createAnimatedComponent(TextBody);

const RedirectionDelay = 1400;
const TextEnteringDelay = 700;

const SplashScreen = () => {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((s) => s.auth.jwt);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!jwt || !user) {
        router.replace("/login");
        return;
      }
      const isTokenValid = isValidToken(jwt);
      if (!isTokenValid) {
        dispatch(logout());
        router.replace("/login");
        return;
      }

      resolvePostAuthRoute(user.id)
        .then((route) => router.replace(route as Href))
        .catch((error) => {
          console.log({ error });

          router.replace("/onboarding/profile");
        });
    }, RedirectionDelay);
    return () => clearTimeout(t);
  }, [dispatch, jwt, user]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      <AnimatedText
        entering={BounceIn}
        exiting={BounceOut.delay(RedirectionDelay * 0.9)}
        type="title"
        style={[globalStyles.text_primary, globalStyles.text_center]}
      >
        LENGA
      </AnimatedText>
      <AnimatedBody
        entering={FadeInDown.delay(TextEnteringDelay)}
        exiting={FadeOut.delay(RedirectionDelay * 0.8)}
        variant="body1"
        style={globalStyles.text_center}
      >
        Menya byinshi ku ikoreshwa ry'amafaranga
      </AnimatedBody>
    </ThemedView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: themeToken.spacing,
    justifyContent: "center",
    padding: themeToken.spacing,
  },
});
