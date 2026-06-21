-- Tu vung nguoi dung luu tu bai hoc (boi den -> Luu)
CREATE TABLE IF NOT EXISTS user_saved_words (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id   UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  context_en      TEXT,
  note            TEXT,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, vocabulary_id)
);

CREATE INDEX IF NOT EXISTS idx_user_saved_words_user
  ON user_saved_words (user_id, saved_at DESC);
