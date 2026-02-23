import api from '@/utils/api';
import type { EnrollmentPayload } from '@/types/api';
import type { AxiosResponse } from 'axios';

type StrapiEnrollment = {
  id: number;
  documentId: string;
  enrollment_status: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
};

export function createEnrollment(payload: EnrollmentPayload): Promise<AxiosResponse<{ data: StrapiEnrollment }>> {
  return api.post('/api/enrollments', { data: payload });
}
