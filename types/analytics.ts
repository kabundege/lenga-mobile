import type { StrapiListResponse } from '@/types/api';

/** Gender values on `extended-profile` (lenga-api). */
export type Gender = 'Male' | 'Female' | 'Other' | 'PreferNotToSay';

export type ModuleAttendanceStatus = 'started' | 'completed';

export type StrapiExtendedProfile = {
  id: number;
  documentId: string;
  full_name?: string | null;
  gender?: Gender | null;
  age?: number | null;
  is_pwd?: boolean;
  cooperative_name?: string | null;
  is_cooperative_member?: boolean;
  district?: string | null;
  sector?: string | null;
};

export type StrapiModuleAttendance = {
  id: number;
  documentId: string;
  status: ModuleAttendanceStatus;
  progress_percentage: number;
  completed_at?: string | null;
};

export type ExtendedProfileInput = {
  full_name?: string;
  gender: Gender;
  age: number;
  is_pwd: boolean;
  is_cooperative_member: boolean;
  cooperative_name?: string;
  district: string;
  sector: string;
};

export type ModuleAttendanceInput = {
  userId: number;
  lessonId: number;
  status: ModuleAttendanceStatus;
  progress_percentage: number;
  completed_at?: string | null;
};

export type AssessmentSubmissionInput = {
  userId: number;
  quizId?: number;
  matchingId?: number;
  score: number;
  total_questions: number;
  is_passed: boolean;
};

export type StrapiExtendedProfileListResponse = StrapiListResponse<StrapiExtendedProfile>;
export type StrapiModuleAttendanceListResponse = StrapiListResponse<StrapiModuleAttendance>;
