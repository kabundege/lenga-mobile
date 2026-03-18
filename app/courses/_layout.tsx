import colors from "@/utils/theme/colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment } from "react";

const CoursesLayout = () => (
    <Fragment>
        <StatusBar style="dark" backgroundColor={colors.primary} />
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[courseId]" options={{ headerShown: false }} />
        </Stack>
    </Fragment>
);

export default CoursesLayout;
