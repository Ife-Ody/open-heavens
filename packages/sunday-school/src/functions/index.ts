// Sunday School utility functions

/**
 * Formats a Sunday School lesson title
 * @param title The lesson title
 * @returns Formatted lesson title
 */
export function formatLessonTitle(title: string): string {
  return title.trim();
}

/**
 * Gets the lesson type based on age group
 * @param age The age of the student
 * @returns The appropriate lesson type
 */
export function getLessonTypeByAge(age: number): string {
  if (age < 13) return 'children';
  if (age < 18) return 'youth';
  return 'adult';
} 