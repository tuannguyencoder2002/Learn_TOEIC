# ERD - Learn TOEIC Database

```
users
  └── exercise_sets (user_id)
  └── source_materials (user_id)
  └── practice_sessions (user_id)
  └── user_question_progress (user_id)
  └── user_vocabulary_progress (user_id)

source_materials
  └── ai_extractions (source_material_id)
        └── exercise_sets (ai_extraction_id)

exercise_sets
  └── questions (exercise_set_id)
        ├── question_options
        ├── question_vocabulary ── vocabulary
        └── question_grammar ── grammar_topics

practice_sessions
  └── practice_answers ── questions

user_question_progress ── questions  (SRS / on lai)
```

## Luồng chính

### 1. Import ảnh bài tập
```
Upload ảnh → source_materials
     ↓
AI review  → ai_extractions (raw_response JSONB)
     ↓
Parse      → exercise_sets + questions + options + vocabulary
     ↓
Init SRS   → user_question_progress (next_review_at = NOW)
```

### 2. Luyện tập / Ôn lại
```
GET /api/practice/review?mode=due|weak|set
     ↓
v_due_questions / v_weak_questions
     ↓
User trả lời → practice_answers
     ↓
Cập nhật SRS → user_question_progress
  - Đúng: interval_days tăng, next_review_at xa hơn
  - Sai:  reset interval, next_review_at = NOW + vài giờ
  - 3 lần đúng liên tiếp → mastery_level = 3 (thuần thục)
```

## Mastery levels
| Level | Ý nghĩa |
|-------|---------|
| 0 | Mới import / chưa học |
| 1 | Đang học |
| 2 | Đang ôn lại |
| 3 | Thuần thục (không đưa vào queue) |

Sau đó thêm vào `.env.local` (hoặc chạy `setup.bat` tự tạo):

```
DATABASE_URL=postgresql://postgres:tttt2002@localhost:5432/learn_toeic
DEFAULT_USERNAME=default
```
