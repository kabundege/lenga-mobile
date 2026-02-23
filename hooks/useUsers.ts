import { useQuery } from '@tanstack/react-query';
import * as usersService from '@/services/users.service';
import type { StrapiUser } from '@/types/api';

export const USER_KEYS = {
  ALL: 'users',
  STUDENTS: 'usersStudents',
  INSTRUCTORS: 'usersInstructors',
} as const;

function usersFromResponse(res: { data?: unknown } | undefined): StrapiUser[] {
  const body = res?.data as { data?: StrapiUser[] } | undefined;
  return Array.isArray(body?.data) ? body.data : [];
}

export function useAllUsers() {
  const request = useQuery({
    queryKey: [USER_KEYS.ALL],
    queryFn: () => usersService.getAllUsers(),
  });
  return { ...request, users: usersFromResponse(request.data) };
}

export function useStudents() {
  const request = useQuery({
    queryKey: [USER_KEYS.STUDENTS],
    queryFn: () => usersService.getStudents(),
  });
  return { ...request, students: usersFromResponse(request.data) };
}

export function useInstructors() {
  const request = useQuery({
    queryKey: [USER_KEYS.INSTRUCTORS],
    queryFn: () => usersService.getInstructors(),
  });
  return { ...request, instructors: usersFromResponse(request.data) };
}
