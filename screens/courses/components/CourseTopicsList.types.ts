import type { StrapiLessonMinimal, StrapiTopicWithLessons } from '@/types/api';

export type CourseTopicsListProps = {
  topics: StrapiTopicWithLessons[];
};

export type TopicBlockProps = {
  index: number;
  topic: StrapiTopicWithLessons;
};

export type TopicLessonItemProps = {
  lesson: StrapiLessonMinimal;
  index: number;
};
