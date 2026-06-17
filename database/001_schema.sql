-- Schema tables (chay tren database learn_toeic)
-- Tao DB bang scripts/setup-db.js

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(100) NOT NULL UNIQUE,
  display_name  VARCHAR(200),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grammar_topics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(80) UNIQUE,
  name_vi       VARCHAR(200) NOT NULL,
  name_en       VARCHAR(200),
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vocabulary (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word              VARCHAR(200) NOT NULL,
  word_normalized   VARCHAR(200) NOT NULL,
  meaning_vi        TEXT NOT NULL,
  part_of_speech    VARCHAR(50),
  example_en        TEXT,
  phonetic          VARCHAR(100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_unique ON vocabulary (word_normalized, COALESCE(part_of_speech, ''));
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary (word_normalized);

CREATE TABLE IF NOT EXISTS source_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  title           VARCHAR(300),
  material_type   VARCHAR(50) NOT NULL DEFAULT 'image',
  file_name       VARCHAR(500),
  file_path       TEXT,
  mime_type       VARCHAR(100),
  file_size_bytes BIGINT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_extractions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_material_id  UUID NOT NULL REFERENCES source_materials(id) ON DELETE CASCADE,
  model_id            VARCHAR(100),
  status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  raw_response        JSONB,
  review_summary_vi   TEXT,
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_extractions_source ON ai_extractions (source_material_id);

CREATE TABLE IF NOT EXISTS exercise_sets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  source_material_id  UUID REFERENCES source_materials(id) ON DELETE SET NULL,
  ai_extraction_id    UUID REFERENCES ai_extractions(id) ON DELETE SET NULL,
  title               VARCHAR(300) NOT NULL,
  source_type         VARCHAR(50) NOT NULL
                      CHECK (source_type IN ('seed', 'image_import', 'ai_generate', 'manual')),
  part_number         SMALLINT NOT NULL DEFAULT 5,
  category            VARCHAR(50),
  difficulty          VARCHAR(20),
  question_count      INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_sets_user ON exercise_sets (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_set_id   UUID NOT NULL REFERENCES exercise_sets(id) ON DELETE CASCADE,
  sort_order        INT NOT NULL DEFAULT 0,
  sentence          TEXT NOT NULL,
  correct_index     SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  category          VARCHAR(50) NOT NULL
                    CHECK (category IN ('word_form', 'grammar', 'vocabulary', 'collocation')),
  topic             VARCHAR(200),
  explanation_en    TEXT,
  explanation_vi    TEXT,
  difficulty        VARCHAR(20),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exercise_set_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_questions_set ON questions (exercise_set_id, sort_order);

CREATE TABLE IF NOT EXISTS question_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_index  SMALLINT NOT NULL CHECK (option_index BETWEEN 0 AND 3),
  option_text   VARCHAR(500) NOT NULL,
  UNIQUE (question_id, option_index)
);

CREATE TABLE IF NOT EXISTS question_vocabulary (
  question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  vocabulary_id   UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS question_grammar (
  question_id       UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  grammar_topic_id  UUID NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, grammar_topic_id)
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  session_type      VARCHAR(50) NOT NULL
                    CHECK (session_type IN ('set_practice', 'review', 'weak_points', 'image_set')),
  exercise_set_id   UUID REFERENCES exercise_sets(id) ON DELETE SET NULL,
  total_questions   INT NOT NULL DEFAULT 0,
  correct_count     INT NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS practice_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(id),
  selected_index  SMALLINT CHECK (selected_index BETWEEN 0 AND 3),
  is_correct      BOOLEAN NOT NULL,
  time_spent_ms   INT,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_answers_session ON practice_answers (session_id);
CREATE INDEX IF NOT EXISTS idx_practice_answers_question ON practice_answers (question_id);

CREATE TABLE IF NOT EXISTS user_question_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  question_id           UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  times_seen            INT NOT NULL DEFAULT 0,
  times_correct         INT NOT NULL DEFAULT 0,
  times_wrong           INT NOT NULL DEFAULT 0,
  consecutive_correct   INT NOT NULL DEFAULT 0,
  mastery_level         SMALLINT NOT NULL DEFAULT 0
                        CHECK (mastery_level BETWEEN 0 AND 3),
  ease_factor           NUMERIC(4, 2) NOT NULL DEFAULT 2.50,
  interval_days         INT NOT NULL DEFAULT 0,
  next_review_at        TIMESTAMPTZ,
  last_practiced_at     TIMESTAMPTZ,
  last_wrong_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_uqp_review ON user_question_progress (user_id, next_review_at)
  WHERE mastery_level < 3;

CREATE INDEX IF NOT EXISTS idx_uqp_weak ON user_question_progress (user_id, times_wrong DESC)
  WHERE times_wrong > 0 AND mastery_level < 3;

CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  vocabulary_id     UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  times_seen        INT NOT NULL DEFAULT 0,
  times_correct     INT NOT NULL DEFAULT 0,
  mastery_level     SMALLINT NOT NULL DEFAULT 0,
  next_review_at    TIMESTAMPTZ,
  last_reviewed_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, vocabulary_id)
);

CREATE OR REPLACE VIEW v_due_questions AS
SELECT
  uqp.user_id,
  q.id AS question_id,
  q.exercise_set_id,
  q.sentence,
  q.correct_index,
  q.category,
  q.topic,
  q.explanation_en,
  q.explanation_vi,
  uqp.mastery_level,
  uqp.times_wrong,
  uqp.next_review_at,
  uqp.last_wrong_at,
  es.title AS set_title
FROM user_question_progress uqp
JOIN questions q ON q.id = uqp.question_id AND q.is_active = TRUE
JOIN exercise_sets es ON es.id = q.exercise_set_id
WHERE uqp.mastery_level < 3
  AND (uqp.next_review_at IS NULL OR uqp.next_review_at <= NOW());

CREATE OR REPLACE VIEW v_weak_questions AS
SELECT
  uqp.user_id,
  q.id AS question_id,
  q.exercise_set_id,
  q.sentence,
  q.correct_index,
  q.category,
  q.topic,
  q.explanation_en,
  q.explanation_vi,
  uqp.times_wrong,
  uqp.times_correct,
  uqp.mastery_level,
  es.title AS set_title
FROM user_question_progress uqp
JOIN questions q ON q.id = uqp.question_id AND q.is_active = TRUE
JOIN exercise_sets es ON es.id = q.exercise_set_id
WHERE uqp.times_wrong > 0 AND uqp.mastery_level < 3;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_uqp_updated ON user_question_progress;
CREATE TRIGGER trg_uqp_updated
  BEFORE UPDATE ON user_question_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_uvp_updated ON user_vocabulary_progress;
CREATE TRIGGER trg_uvp_updated
  BEFORE UPDATE ON user_vocabulary_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
