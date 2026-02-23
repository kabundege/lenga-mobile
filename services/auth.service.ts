import api from '@/utils/api';
import type {
  StrapiAuthResponse,
  StrapiUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/types/api';
import type { AxiosResponse } from 'axios';

export function login(payload: LoginPayload): Promise<AxiosResponse<StrapiAuthResponse>> {
  return api.post<StrapiAuthResponse>('/api/auth/local', payload);
}

export function register(payload: RegisterPayload): Promise<AxiosResponse<StrapiAuthResponse>> {
  return api.post<StrapiAuthResponse>('/api/auth/local/register', payload);
}

export function getMe(): Promise<AxiosResponse<StrapiUser>> {
  return api.get<StrapiUser>('/api/auth/users/me');
}

export function updateProfile(
  userId: number,
  payload: UpdateProfilePayload
): Promise<AxiosResponse<StrapiUser>> {
  return api.put<StrapiUser>(`/api/auth/users/${userId}`, payload);
}
