import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import * as authService from '@/services/auth.service';
import { setCredentials, setUser } from '@/store/slices/authSlice';
import { syncOfflineLearningContent } from '@/store/slices/offlineContentSlice';
import type { UpdateProfilePayload } from '@/types/api';
import { handleAxiosError } from '@/utils/error.util';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

/** Query keys for auth; use getMeKeys() for invalidation. */
export const AUTH_KEYS = {
  ME: ['auth', 'me'] as const,
};

export const getMeKeys = (email?: string) => [...AUTH_KEYS.ME, { email }];

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
      dispatch(syncOfflineLearningContent({ locale })).catch(() => null);
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
    onSuccess: (res) => {
      const { jwt, user } = res.data;
      dispatch(setCredentials({ jwt, user }));
      queryClient.setQueryData(AUTH_KEYS.ME, user);
      dispatch(syncOfflineLearningContent({ locale })).catch(() => null);
      toast.success('Registration successful');
      options?.onSuccess?.();
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
  const user = (request.data?.data ?? null)
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
