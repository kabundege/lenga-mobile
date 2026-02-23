import api from '@/utils/api';
import type { StrapiUser } from '@/types/api';
import type { AxiosResponse } from 'axios';

type StrapiListUser = StrapiUser[];

export function getAllUsers(): Promise<AxiosResponse<StrapiListUser>> {
  return api.get('/api/users', { params: { populate: 'role' } });
}

export function getStudents(): Promise<AxiosResponse<StrapiListUser>> {
  return api.get('/api/users', {
    params: { populate: 'role', 'filters[role][type][$eq]': 'student' },
  });
}

export function getInstructors(): Promise<AxiosResponse<StrapiListUser>> {
  return api.get('/api/users', {
    params: { populate: 'role', 'filters[role][type][$eq]': 'instructor' },
  });
}
