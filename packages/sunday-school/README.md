# @repo/sunday-school

This package contains utilities and data related to Sunday School materials.

## Usage

```tsx
import { formatLessonTitle, getLessonTypeByAge, LESSON_TYPES } from "@repo/sunday-school";

// Format a lesson title
const formattedTitle = formatLessonTitle("  Introduction to Faith  ");

// Get lesson type based on age
const lessonType = getLessonTypeByAge(15); // Returns 'youth'

// Use constants
console.log(LESSON_TYPES.ADULT); // 'adult'
```

## Features

- Utility functions for handling Sunday School lessons
- Constants for lesson types and categories
- Helper functions for age-appropriate content

## Development

To add new functionality to this package, create new files in the appropriate directories:
- `/constants` - For static values and enumerations
- `/functions` - For utility functions and helpers 