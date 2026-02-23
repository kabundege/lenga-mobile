import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/hooks/useRedux';
import { setCredentials, setUser } from '@/store/slices/authSlice';
import * as authService from '@/services/auth.service';
import type { LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/types/api';
import { handleAxiosError } from '@/utils/error.util';

export const AUTH_KEYS = {
  ME: ['auth', 'me'] as const,
};

export function useLogin(options?: { onSuccess?: () => void }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (res) => {
      const { jwt, user } = res.data;
      dispatch(setCredentials({ jwt, user }));
      queryClient.setQueryData(AUTH_KEYS.ME, user);
      options?.onSuccess?.();
    },
    onError: handleAxiosError,
  });
}

export function useRegister(options?: { onSuccess?: () => void }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (res) => {
      const { jwt, user } = res.data;
      dispatch(setCredentials({ jwt, user }));
      queryClient.setQueryData(AUTH_KEYS.ME, user);
      options?.onSuccess?.();
    },
    onError: handleAxiosError,
  });
}

export function useMe(enabled = true) {
  const request = useQuery({
    queryKey: AUTH_KEYS.ME,
    queryFn: () => authService.getMe(),
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
      options?.onSuccess?.();
    },
    onError: handleAxiosError,
  });
}
