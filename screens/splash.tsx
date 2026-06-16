import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
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
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";
import { centered } from "@/utils/styles";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedText = Animated.createAnimatedComponent(ThemedText);
const AnimatedBody = Animated.createAnimatedComponent(TextBody);

const logos = [
  {
    src: require("@/assets/logos/gov_logo.png"),
    alt: "Gov",
  },
  {
    src: require("@/assets/logos/unctad_logo.png"),
    alt: "UNCTAD",
  },
  {
    src: require("@/assets/logos/trade_center_logo.png"),
    alt: "Trade Center",
  },
  {
    src: require("@/assets/logos/eu_logo.png"),
    alt: "EU",
  },
  {
    src: require("@/assets/logos/sdg_fund_logo.webp"),
    alt: "SDG Fund",
  },
  {
    src: require("@/assets/logos/iom_logo.png"),
    alt: "IOC",
  },
];

const RedirectionDelay = 2000;
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
      <View
        style={[
          globalStyles.flex_1,
          globalStyles.items_center,
          globalStyles.justify_center,
        ]}
      >
        <SafeAreaView style={[globalStyles.w_full_screen, globalStyles.px_lg]}>
          <Image
            style={styles.brand}
            source={require("@/assets/logos/uncdf_logo.png")}
          />
        </SafeAreaView>
        <View style={[globalStyles.flex_1, centered]}>
          <AnimatedText
            entering={BounceIn}
            exiting={BounceOut.delay(RedirectionDelay * 0.9)}
            type="title"
            style={[globalStyles.text_primary, globalStyles.text_center]}
          >
            LENGA
          </AnimatedText>
          <AnimatedBody
            // variant="body1"
            style={globalStyles.text_center}
            entering={FadeInDown.delay(TextEnteringDelay)}
            exiting={FadeOut.delay(RedirectionDelay * 0.8)}
          >
            Sobanukirwa ikoreshwa ry'amafaranga
          </AnimatedBody>
        </View>
      </View>
      <View
        style={[
          globalStyles.p_lg,
          globalStyles.gap_xs,
          globalStyles.self_end,
          globalStyles.flex_row,
          globalStyles.flex_wrap,
          globalStyles.justify_between,
        ]}
      >
        {logos.map((logo, index) => (
          <Animated.Image
            key={logo.src}
            alt={logo.alt}
            source={logo.src}
            style={styles.logo}
            entering={FadeInDown.delay(TextEnteringDelay + 100 * (index + 1))}
          />
        ))}
      </View>
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
  logo: {
    width: 100,
    height: 100,
    objectFit: "contain",
  },
  brand: {
    width: 100,
    height: 100,
    objectFit: "contain",
    alignSelf: "flex-end",
  },
});
