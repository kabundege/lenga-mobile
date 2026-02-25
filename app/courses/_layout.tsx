import colors from "@/utils/theme/colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const CoursesLayout = () => (
    <Stack>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[courseId]" options={{ headerShown: false }} />
    </Stack>
);

export default CoursesLayout;
