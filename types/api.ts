/**
 * Strapi API types from lenga-app-backend.
 * Auth responses use { jwt, user }; GET/PUT use { data, meta? }.
 */

export type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type StrapiMeta = {
  pagination?: StrapiPagination;
};

// Auth
export type StrapiAuthResponse = {
  jwt: string;
  user: StrapiUser;
};

export type StrapiRole = {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export type StrapiEnrollmentMinimal = {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  enrollment_status: string;
};

export type StrapiUser = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  full_name: string;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  age: number | null;
  role?: StrapiRole;
  enrollments?: StrapiEnrollmentMinimal[];
};

// Course list/detail (from GET /api/courses)
export type StrapiCourseCategory = {
  id: number;
  documentId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
};

export type StrapiInstructor = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  full_name: string;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  age: number | null;
};

export type StrapiInstitution = {
  id: number;
  documentId: string;
  name: string;
  description: string;
  country: string;
  city: string;
  website: string | null;
  telephone: string | null;
  address_facebook: string | null;
  address_linkedin: string | null;
  address_x: string | null;
  address_youtube: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
};

export type StrapiTopicMinimal = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
};

export type StrapiLessonDetailBlock = {
  type: string;
  children?: Array<{ type: string; text?: string }>;
};

export type StrapiLessonDescription = {
  text_description?: string | null;
  audio_description_url?: string | null;
};

export type StrapiVideoLessonDetail = {
  __component: 'lessons.video-lesson';
  id: number;
  video_url: string;
  duration_seconds: number | null;
  poster_url: string | null;
  description?: StrapiLessonDetailBlock[];
};

export type StrapiLessonMinimal = {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  lesson_type: string;
  topic?: StrapiTopicMinimal;
  lesson_description?: StrapiLessonDescription;
  /** Populated when using populate[lessons][populate][lesson_details] */
  lesson_details?: StrapiVideoLessonDetail;
  /** Populated when using populate[lessons][populate][video_lesson_details] (matches admin API) */
  video_lesson_details?: StrapiVideoLessonDetail;
};

export type StrapiTopicWithLessons = StrapiTopicMinimal & {
  lessons?: StrapiLessonMinimal[];
};

export type StrapiCourse = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  course_categories?: StrapiCourseCategory[];
  courses_instructors?: StrapiInstructor[];
  course_provider_institutions?: StrapiInstitution[];
  authors?: StrapiInstructor[];
  enrollments?: StrapiEnrollmentMinimal[];
  course_thumbnail?: unknown;
  topics?: StrapiTopicMinimal[] | StrapiTopicWithLessons[];
  localizations?: unknown[];
};

export type StrapiCourseDetail = StrapiCourse & {
  topics?: StrapiTopicWithLessons[];
};

// Enrollment payload
export type EnrollmentPayload = {
  enrollment_status?: string;
  users_permissions_user: number;
  course: number;
  locale?: string;
};

// Profile update payload
export type UpdateProfilePayload = {
  full_name?: string;
  gender?: string;
  age?: number;
};

// Register payload
export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

// Login payload
export type LoginPayload = {
  identifier: string;
  password: string;
};

// Strapi GET response wrapper
export type StrapiResponse<T> = {
  data: T;
  meta?: StrapiMeta;
};

export type StrapiListResponse<T> = {
  data: T[];
  meta?: StrapiMeta;
};
