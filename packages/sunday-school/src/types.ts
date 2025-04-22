/**
 * Sunday School lesson type
 */
export type LessonType = 'adult' | 'youth' | 'children';

/**
 * Sunday School lesson interface
 */
export interface SundaySchoolLesson {
  id: string;
  title: string;
  description: string;
  scriptures: string[];
  date: string;
  type: LessonType;
  content: string;
}