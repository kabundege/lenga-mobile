import colors from '@/utils/theme/colors';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fragment } from 'react';

const LessonsLayout = () => (
  <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="[lessonId]" options={{ headerShown: false }} />
    <Stack.Screen name="chapters/[chapterId]" options={{ headerShown: false }} />
  </Stack>
);

export default LessonsLayout;
