import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import * as authService from '@/services/auth.service';
import { setCredentials, setUser } from '@/store/slices/authSlice';
import type { UpdateProfilePayload } from '@/types/api';
import { handleAxiosError } from '@/utils/error.util';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import * as lessonsService from '@/services/lessons.service';
import { syncLessonMediaAssets } from '@/store/slices/offlineContentSlice';
import { api_keys } from '@/hooks/useLessons';

/** Query keys for auth; use getMeKeys() for invalidation. */
export const AUTH_KEYS = {
  ME: ['auth', 'me'] as const,
};

export const getMeKeys = (email?: string) => [...AUTH_KEYS.ME, { email }];

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * After a successful login/register, pre-warm the QueryClient cache for all
 * learning data and immediately kick off media-asset downloads.
 */
async function warmCacheAndSync(
  queryClient: ReturnType<typeof useQueryClient>,
  dispatch: ReturnType<typeof useAppDispatch>,
  locale: string,
) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: api_keys.lessons(locale),
      queryFn: () => lessonsService.getLessonsList(locale),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: api_keys.chapters(locale),
      queryFn: () => lessonsService.getChaptersList(locale),
      staleTime: 24 * 60 * 60 * 1000, // a day
    }),
    queryClient.prefetchQuery({
      queryKey: api_keys.videos(locale),
      queryFn: () => lessonsService.getVideosList(locale),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: api_keys.quizzes(locale),
      queryFn: () => lessonsService.getQuizzesList(locale),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: api_keys.qas(locale),
      queryFn: () => lessonsService.getQAsList(locale),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: api_keys.matchings(locale),
      queryFn: () => lessonsService.getMatchingsList(locale),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: api_keys.matchingQuestions(locale),
      queryFn: () => lessonsService.getMatchingQuestionsList(locale),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: api_keys.matchingAnswers(locale),
      queryFn: () => lessonsService.getMatchingAnswersList(locale),
      staleTime: 5 * 60 * 1000,
    }),
  ]);

  dispatch(syncLessonMediaAssets({ queryClient, locale })).catch(() => null);
}

export function useLogin(options?: { onSuccess?: () => void }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const locale = useAppSelector((s) => s.preferences.locale);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      const { jwt, user } = res.data;
      dispatch(setCredentials({ jwt, user }));
      queryClient.setQueryData(AUTH_KEYS.ME, user);
      warmCacheAndSync(queryClient, dispatch, locale).catch(() => null);
      toast.success('Login successful');
      options?.onSuccess?.();
    },
    onError: handleAxiosError,
  });
}

export function useRegister(options?: { onSuccess?: () => void }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const locale = useAppSelector((s) => s.preferences.locale);

  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Registration successful');
    },
    onError: handleAxiosError,
  });
}

/** Logged-in user profile (GET /api/auth/users/me). */
export function useMe(enabled = true) {
  const storedUser = useAppSelector((s) => s.auth.user);
  const request = useQuery({
    queryKey: getMeKeys(storedUser?.email),
    queryFn: authService.getMe,
    enabled,
  });
  const user = request.data?.data ?? null;
  return { ...request, user };
}

export function useUpdateProfile(options?: { onSuccess?: () => void }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateProfilePayload }) =>
      authService.updateProfile(userId, payload),
    onSuccess: (res) => {
      const user = res.data;
      dispatch(setUser(user));
      queryClient.setQueryData(AUTH_KEYS.ME, user);
      toast.success('Profile updated');
      options?.onSuccess?.();
    },
    onError: handleAxiosError,
  });
}
