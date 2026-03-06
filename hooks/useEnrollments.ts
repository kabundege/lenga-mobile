import { AUTH_KEYS } from '@/hooks/useAuth';
import { getCourseListKeys } from '@/hooks/useCourses';
import * as enrollmentsService from '@/services/enrollments.service';
import { handleAxiosError } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

export function useEnrollCourse(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsService.createEnrollment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.ME });
      queryClient.invalidateQueries({ queryKey: [getCourseListKeys(variables.locale ?? 'rw')[0]] });
      toast.success('Enrolled successfully');
      options?.onSuccess?.();
    },
    onError: handleAxiosError,
  });
}
