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

export type StrapiEntityId = number | string;

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
  children?: { type: string; text?: string }[];
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

export type StrapiMedia = {
  id: StrapiEntityId;
  documentId?: string;
  name: string;
  url: string;
  mime: string;
};

export type StrapiQA = {
  locale: string;
  createdAt: string;
  updatedAt: string;
  id: StrapiEntityId;
  documentId: string;
  audio_desc: StrapiMedia;
  quiz?: StrapiQuiz | null;
  is_correct_answer: boolean;
  publishedAt: string | null;
  thumbnail?: StrapiMedia | null;
};

export type StrapiQuiz = {
  id: StrapiEntityId;
  documentId: string;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  locale: string;
  qas?: StrapiQA[];
  order: number;
  publishedAt: string | null;
  audio_desc?: StrapiMedia | null;
  title_image?: StrapiMedia | null;
  title_image_audio?: StrapiMedia | null;
  lesson_chapter?: StrapiLessonChapter | null;
};

export type StrapiLessonVideo = {
  id: StrapiEntityId;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  lesson_video?: StrapiMedia | null;
  lesson_chapter?: StrapiLessonChapter | null;
};

export type StrapiMatchingAnswer = {
  id: StrapiEntityId;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  thumbnail: StrapiMedia;
  matchings?: StrapiMatching[];
};

export type StrapiMatchingQuestion = {
  id: StrapiEntityId;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  thumbnail: StrapiMedia;
  matching?: StrapiMatching | null;
  matching_answer?: StrapiMatchingAnswer | null;
};

export type StrapiMatching = {
  id: StrapiEntityId;
  documentId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  audio_desc?: StrapiMedia | null;
  matching_answers?: StrapiMatchingAnswer[];
  matching_questions?: StrapiMatchingQuestion[];
  lesson_chapter?: StrapiLessonChapter | null;
};

export type StrapiLessonChapter = {
  title: string;
  order: number;
  id: StrapiEntityId;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  thumbnail?: StrapiMedia | null;
  audio_desc?: StrapiMedia | null;
  quizzes?: StrapiQuiz[];
  matchings?: StrapiMatching[];
  lesson_video?: StrapiLessonVideo | null;
};

export type StrapiLesson = {
  id: StrapiEntityId;
  documentId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  thumbnail?: StrapiMedia | null;
  audio_desc?: StrapiMedia | null;
  lesson_chapters?: StrapiLessonChapter[];
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
