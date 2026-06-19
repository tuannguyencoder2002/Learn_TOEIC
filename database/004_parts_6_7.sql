-- Part 6 & 7 support: doan van (passages), part_number, mo rong category
-- Chay sau 001/003/002. Idempotent — chay lai an toan.
SET client_encoding TO 'UTF8';

-- 1) Cot part_number + question_text cho bang questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS part_number SMALLINT NOT NULL DEFAULT 5;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_text TEXT;

-- 2) Bang doan van dung chung cho Part 6 (text completion) va Part 7 (reading)
CREATE TABLE IF NOT EXISTS passages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_set_id UUID REFERENCES exercise_sets(id) ON DELETE CASCADE,
  part_number     SMALLINT NOT NULL DEFAULT 7,
  passage_type    VARCHAR(50),
  title           VARCHAR(300),
  passage_text    TEXT NOT NULL,
  passage_vi      TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage_id UUID REFERENCES passages(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_questions_part ON questions (part_number) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_passages_set ON passages (exercise_set_id, sort_order);

-- 3) Noi rong rang buoc category de chua cac dang cau hoi Part 6/7
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_category_check;
ALTER TABLE questions ADD CONSTRAINT questions_category_check
  CHECK (category IN (
    'word_form', 'grammar', 'vocabulary', 'collocation',
    'text_completion', 'sentence_insertion', 'connector', 'reading'
  ));
