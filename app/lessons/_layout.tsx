import { Stack } from 'expo-router';

const LessonsLayout = () => (
  <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="[lessonId]" options={{ headerShown: false }} />
    <Stack.Screen name="chapters/[chapterId]/quiz" options={{ headerShown: false }} />
    <Stack.Screen name="chapters/[chapterId]/video" options={{ headerShown: false }} />
  </Stack>
);

export default LessonsLayout;
