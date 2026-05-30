import type {
  AssessmentSubmissionInput,
  ExtendedProfileInput,
  ModuleAttendanceInput,
  StrapiExtendedProfile,
  StrapiExtendedProfileListResponse,
  StrapiModuleAttendance,
  StrapiModuleAttendanceListResponse,
} from '@/types/analytics';
import type { StrapiResponse } from '@/types/api';
import api from '@/utils/api';

const toNumericId = (value: number | string): number =>
  typeof value === 'number' ? value : Number(value);

export async function findExtendedProfileByUserId(userId: number) {
  const res = await api.get<StrapiExtendedProfileListResponse>('/api/extended-profiles', {
    params: {
      'filters[user][id][$eq]': userId,
      'pagination[pageSize]': 1,
    },
  });

  return res.data.data[0] ?? null;
}

export async function createExtendedProfile(userId: number, input: ExtendedProfileInput) {
  const res = await api.post<StrapiResponse<StrapiExtendedProfile>>('/api/extended-profiles', {
    data: {
      user: userId,
      gender: input.gender,
      age: input.age,
      is_pwd: input.is_pwd,
      is_cooperative_member: input.is_cooperative_member,
      cooperative_name: input.cooperative_name ?? null,
      district: input.district,
      sector: input.sector,
    },
  });

  return res.data.data;
}

export async function updateExtendedProfile(
  documentId: string,
  input: ExtendedProfileInput,
) {
  const res = await api.put<StrapiResponse<StrapiExtendedProfile>>(
    `/api/extended-profiles/${documentId}`,
    {
      data: {
        gender: input.gender,
        age: input.age,
        is_pwd: input.is_pwd,
        is_cooperative_member: input.is_cooperative_member,
        cooperative_name: input.cooperative_name ?? null,
        district: input.district,
        sector: input.sector,
      },
    },
  );

  return res.data.data;
}

export async function findModuleAttendance(userId: number, lessonId: number | string) {
  const res = await api.get<StrapiModuleAttendanceListResponse>('/api/module-attendances', {
    params: {
      'filters[user][id][$eq]': userId,
      'filters[lesson][id][$eq]': toNumericId(lessonId),
      'pagination[pageSize]': 1,
    },
  });

  return res.data.data[0] ?? null;
}

export async function createModuleAttendance(input: ModuleAttendanceInput) {
  const res = await api.post<StrapiResponse<StrapiModuleAttendance>>('/api/module-attendances', {
    data: {
      user: input.userId,
      lesson: input.lessonId,
      status: input.status,
      progress_percentage: input.progress_percentage,
      completed_at: input.completed_at ?? null,
    },
  });

  return res.data.data;
}

export async function updateModuleAttendance(
  documentId: string,
  input: Omit<ModuleAttendanceInput, 'userId' | 'lessonId'>,
) {
  const res = await api.put<StrapiResponse<StrapiModuleAttendance>>(
    `/api/module-attendances/${documentId}`,
    {
      data: {
        status: input.status,
        progress_percentage: input.progress_percentage,
        completed_at: input.completed_at ?? null,
      },
    },
  );

  return res.data.data;
}

export async function createAssessmentSubmission(input: AssessmentSubmissionInput) {
  const data: Record<string, unknown> = {
    user: input.userId,
    score: input.score,
    total_questions: input.total_questions,
    is_passed: input.is_passed,
  };

  if (input.quizId != null) data.quiz = input.quizId;
  if (input.matchingId != null) data.matching = input.matchingId;

  await api.post('/api/assessment-submissions', { data });
}

export async function resolvePostAuthRoute(userId: number): Promise<'/lessons' | '/onboarding/profile'> {
  const profile = await findExtendedProfileByUserId(userId);
  return profile ? '/lessons' : '/onboarding/profile';
}
