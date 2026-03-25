import type {
  LoginPayload,
  RegisterPayload,
  StrapiAuthResponse,
  StrapiUser,
  UpdateProfilePayload,
} from '@/types/api';
import api from '@/utils/api';

export function login(payload: LoginPayload) {
  return api.post<StrapiAuthResponse>('/api/auth/local', payload);
}

export function register(payload: RegisterPayload) {
  return api.post<StrapiAuthResponse>('/api/auth/local/register', payload);
}

/**
 * Logged-in user profile.
 * GET /api/auth/users/me — returns the current user with role.
 */
export function getMe() {
  return api.get<StrapiUser>('/api/users/me?populate=role');
}

export function updateProfile(
  userId: number,
  payload: UpdateProfilePayload
) {
  return api.put<StrapiUser>(`/api/auth/users/${userId}`, payload);
}
