-- Luu tu vung nguoi dung "boi den" de on lap di lap lai (SRS).
-- Tan dung bang user_vocabulary_progress co san, them cot can thiet.
-- Idempotent — chay lai an toan.
SET client_encoding TO 'UTF8';

ALTER TABLE user_vocabulary_progress ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_vocabulary_progress ADD COLUMN IF NOT EXISTS context_en TEXT;
ALTER TABLE user_vocabulary_progress ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE user_vocabulary_progress ADD COLUMN IF NOT EXISTS interval_days INT NOT NULL DEFAULT 0;
ALTER TABLE user_vocabulary_progress ADD COLUMN IF NOT EXISTS times_wrong INT NOT NULL DEFAULT 0;
ALTER TABLE user_vocabulary_progress ADD COLUMN IF NOT EXISTS consecutive_correct INT NOT NULL DEFAULT 0;
ALTER TABLE user_vocabulary_progress ADD COLUMN IF NOT EXISTS ease_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.50;

-- Cho phep meaning_vi rong khi nguoi dung luu tu chua co nghia (bo sung sau)
ALTER TABLE vocabulary ALTER COLUMN meaning_vi DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_uvp_starred
  ON user_vocabulary_progress (user_id, next_review_at)
  WHERE is_starred = TRUE;
