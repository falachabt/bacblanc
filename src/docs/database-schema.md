# Database Schema Documentation

This document describes the database structure for the administration system.

## Tables Overview

### 1. subjects
Table for managing academic subjects/courses.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key, auto-generated |
| name | text | NO | Subject name (e.g., "Mathématiques") |
| code | text | NO | Subject code (e.g., "MATH") |
| concours_type | text[] | YES | Array of competition types |
| description | text | YES | Subject description |

**Constraints:**
- Primary key: `id`

### 2. exams
Table for managing exams linked to subjects.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key, auto-generated |
| title | text | NO | Exam title |
| subject_id | uuid | YES | Foreign key to subjects table |
| available_at | timestamptz | YES | When exam becomes available |
| status | text | YES | Exam status (draft, published, etc.) |
| description | text | YES | Exam description |
| finished_at | timestamptz | YES | When exam ends |
| duration | time | YES | **GENERATED COLUMN** - calculated from available_at and finished_at |
| code | text | YES | Exam code |
| created_at | timestamptz | YES | Creation timestamp |

**Constraints:**
- Primary key: `id`
- Foreign key: `subject_id` references `subjects(id)` ON DELETE SET NULL

**Important Notes:**
- `duration` is a GENERATED column and should NOT be included in INSERT/UPDATE operations
- Duration is automatically calculated as `(finished_at - available_at)::time`

### 3. questions
Table for managing questions within exams.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key, auto-generated |
| exam_id | uuid | YES | Foreign key to exams table |
| content | text | NO | **Legacy field** - question content |
| type | text | YES | Question type (multiple_choice, single_choice, text) |
| options | jsonb | YES | Answer options as JSON array |
| correct_answer | text | YES | The correct answer |
| created_at | timestamptz | YES | Creation timestamp |
| points | integer | YES | Points awarded for correct answer |
| question_text | text | YES | **New field** - question text content |

**Constraints:**
- Primary key: `id`
- Foreign key: `exam_id` references `exams(id)` ON DELETE CASCADE

**Important Notes:**
- Both `content` and `question_text` exist for backward compatibility
- New implementations should use `question_text`
- `options` should be a valid JSON array when question type requires options

## Data Types and Validation

### Question Types
- `multiple_choice`: Multiple choice question with several options
- `single_choice`: Single choice question with one correct answer
- `text`: Free text answer

### Exam Status Values
- `draft`: Exam is being prepared
- `published`: Exam is available to students
- `archived`: Exam is no longer active

### JSON Structure for Question Options
```json
["Option 1", "Option 2", "Option 3", "Option 4"]
```

## API Field Mapping

When working with the admin interface, note these field mappings:

### Questions
- API uses `question_text` for the question content
- Database has both `content` and `question_text` fields
- Always write to `question_text` for new questions

### Exams
- Never include `duration` in create/update operations
- Use `available_at` and `finished_at` to control exam timing
- `created_at` is automatically set

## Common Queries

### Get exams with subject info
```sql
SELECT exams.*, subjects.name as subject_name, subjects.code as subject_code
FROM exams 
LEFT JOIN subjects ON exams.subject_id = subjects.id
ORDER BY exams.created_at DESC;
```

### Get questions for an exam
```sql
SELECT * FROM questions 
WHERE exam_id = $1 
ORDER BY created_at ASC;
```

### Create new exam (without duration)
```sql
INSERT INTO exams (title, subject_id, status, description, available_at, finished_at)
VALUES ($1, $2, $3, $4, $5, $6);
```