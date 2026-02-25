import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography/textBody';
import { useAppSelector } from '@/hooks/useRedux';
import globalStyles from '@/utils/styles/globalstyles.style';
import { themeToken } from '@/utils/theme/styles';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { BounceIn, BounceOut, FadeInDown, FadeOut } from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(ThemedText);
const AnimatedBody = Animated.createAnimatedComponent(TextBody);

const RedirectionDelay = 1400;
const TextEnteringDelay = 700;

export default function SplashScreen() {
    const jwt = useAppSelector((s) => s.auth.jwt);

    useEffect(() => {
        const t = setTimeout(() => {
            if (jwt) {
                router.replace('/courses');
            } else {
                router.replace('/login');
            }
        }, RedirectionDelay);
        return () => clearTimeout(t);
    }, [jwt]);

    return (
        <ThemedView style={styles.container}>
            <AnimatedText entering={BounceIn} exiting={BounceOut.delay(RedirectionDelay * 0.9)} type="title" style={[globalStyles.text_primary, globalStyles.text_center]}>
                LENGA
            </AnimatedText>
            <AnimatedBody entering={FadeInDown.delay(TextEnteringDelay)} exiting={FadeOut.delay(RedirectionDelay * 0.8)} variant="body1" style={globalStyles.text_center}>
                Menya byinshi ku ikoreshwa ry'amafaranga
            </AnimatedBody>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        gap: themeToken.spacingLg,
        justifyContent: 'center',
        padding: themeToken.spacing,
    },
});
