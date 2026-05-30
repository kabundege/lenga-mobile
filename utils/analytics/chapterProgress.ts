import AsyncStorage from '@react-native-async-storage/async-storage';

const completedChaptersKey = (userId: number, lessonDocumentId: string) =>
  `@lenga/completed-chapters/${userId}/${lessonDocumentId}`;

export const getCompletedChapterIds = async (
  userId: number,
  lessonDocumentId: string,
): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(completedChaptersKey(userId, lessonDocumentId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const markChapterCompleted = async (
  userId: number,
  lessonDocumentId: string,
  chapterDocumentId: string,
): Promise<string[]> => {
  const existing = await getCompletedChapterIds(userId, lessonDocumentId);
  const next = [...new Set([...existing, chapterDocumentId])];
  await AsyncStorage.setItem(
    completedChaptersKey(userId, lessonDocumentId),
    JSON.stringify(next),
  );
  return next;
};

export const computeLessonProgress = (
  completedCount: number,
  totalChapters: number,
): { progress_percentage: number; status: 'started' | 'completed' } => {
  if (totalChapters <= 0) {
    return { progress_percentage: 0, status: 'started' };
  }

  const progress_percentage = Math.min(
    100,
    Math.round((completedCount / totalChapters) * 100),
  );

  return {
    progress_percentage,
    status: progress_percentage >= 100 ? 'completed' : 'started',
  };
};
