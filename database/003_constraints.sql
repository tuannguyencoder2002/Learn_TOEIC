-- Don duplicate questions (giu ban ghi tao som nhat), roi them unique constraint
DELETE FROM questions q1
USING questions q2
WHERE q1.exercise_set_id = q2.exercise_set_id
  AND q1.sort_order = q2.sort_order
  AND q1.created_at > q2.created_at;

DO $$
BEGIN
  ALTER TABLE questions
    ADD CONSTRAINT questions_exercise_set_sort_unique UNIQUE (exercise_set_id, sort_order);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
