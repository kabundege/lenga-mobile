import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as enrollmentsService from '@/services/enrollments.service';
import type { EnrollmentPayload } from '@/types/api';
import { handleAxiosError } from '@/utils/error.util';
import { getCourseListKeys } from '@/hooks/useCourses';
import { AUTH_KEYS } from '@/hooks/useAuth';

export function useEnrollCourse(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnrollmentPayload) => enrollmentsService.createEnrollment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.ME });
      queryClient.invalidateQueries({ queryKey: [getCourseListKeys(variables.locale ?? 'rw')[0]] });
      options?.onSuccess?.();
    },
    onError: handleAxiosError,
  });
}
