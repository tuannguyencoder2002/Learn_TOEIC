import type { PoolClient } from "pg";
import type { QuestionCategory, ToeicQuestion, VocabularyItem } from "../types";

export interface DbQuestionRow {
  question_id: string;
  exercise_set_id: string;
  sentence: string;
  correct_index: number;
  category: QuestionCategory;
  topic: string | null;
  explanation_en: string | null;
  explanation_vi: string | null;
  set_title: string | null;
  part_number?: number;
  question_text?: string | null;
  passage_text?: string | null;
  passage_vi?: string | null;
  passage_title?: string | null;
  passage_type?: string | null;
  mastery_level?: number;
  times_wrong?: number;
}

export interface ParsedQuestionInput {
  sentence: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category: QuestionCategory;
  topic?: string;
  explanation?: string;
  explanationVi?: string;
  questionNumber?: number;
  sentenceComplete?: string;
  sentenceVi?: string;
  correctWord?: string;
  wordType?: string;
  meaningVi?: string;
  grammarHintVi?: string;
  vocabulary?: VocabularyItem[];
}

export interface SaveExerciseSetInput {
  title: string;
  sourceType: "seed" | "image_import" | "ai_generate" | "manual";
  category?: string;
  difficulty?: string;
  sourceMaterialId?: string;
  aiExtractionId?: string;
  questions: ParsedQuestionInput[];
}

function rowToQuestion(
  row: DbQuestionRow,
  options: string[],
  vocabulary: VocabularyItem[]
): ToeicQuestion {
  return {
    id: row.question_id,
    sentence: row.sentence,
    options: options as [string, string, string, string],
    correctIndex: row.correct_index as 0 | 1 | 2 | 3,
    category: row.category,
    topic: row.topic ?? "",
    explanation: row.explanation_en ?? "",
    explanationVi: row.explanation_vi ?? undefined,
    vocabulary,
    partNumber: row.part_number ?? 5,
    questionText: row.question_text ?? undefined,
    passageText: row.passage_text ?? undefined,
    passageVi: row.passage_vi ?? undefined,
    passageTitle: row.passage_title ?? undefined,
    passageType: row.passage_type ?? undefined,
  };
}

function isMissingSchemaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("passages") || msg.includes("part_number") || msg.includes("passage_id");
}

async function queryQuestionRows(
  client: PoolClient,
  questionIds: string[]
): Promise<DbQuestionRow[]> {
  const extended = `SELECT q.id AS question_id, q.exercise_set_id, q.sentence, q.correct_index,
            q.category, q.topic, q.explanation_en, q.explanation_vi, es.title AS set_title,
            q.part_number, q.question_text,
            p.passage_text, p.passage_vi, p.title AS passage_title, p.passage_type
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     LEFT JOIN passages p ON p.id = q.passage_id
     WHERE q.id = ANY($1::uuid[])
     ORDER BY array_position($1::uuid[], q.id)`;

  const legacy = `SELECT q.id AS question_id, q.exercise_set_id, q.sentence, q.correct_index,
            q.category, q.topic, q.explanation_en, q.explanation_vi, es.title AS set_title,
            es.part_number
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.id = ANY($1::uuid[])
     ORDER BY array_position($1::uuid[], q.id)`;

  try {
    const qRes = await client.query<DbQuestionRow>(extended, [questionIds]);
    return qRes.rows;
  } catch (err) {
    if (!isMissingSchemaError(err)) throw err;
    const qRes = await client.query<DbQuestionRow>(legacy, [questionIds]);
    return qRes.rows;
  }
}

export async function loadQuestionDetails(
  client: PoolClient,
  questionIds: string[]
): Promise<ToeicQuestion[]> {
  if (questionIds.length === 0) return [];

  const qRes = await queryQuestionRows(client, questionIds);

  const optRes = await client.query<{ question_id: string; option_index: number; option_text: string }>(
    `SELECT question_id, option_index, option_text
     FROM question_options WHERE question_id = ANY($1::uuid[])
     ORDER BY question_id, option_index`,
    [questionIds]
  );

  const vocabRes = await client.query<{
    question_id: string;
    word: string;
    meaning_vi: string;
    part_of_speech: string | null;
    example_en: string | null;
  }>(
    `SELECT qv.question_id, v.word, v.meaning_vi, v.part_of_speech, v.example_en
     FROM question_vocabulary qv
     JOIN vocabulary v ON v.id = qv.vocabulary_id
     WHERE qv.question_id = ANY($1::uuid[])`,
    [questionIds]
  );

  const optionsMap = new Map<string, string[]>();
  for (const o of optRes.rows) {
    const arr = optionsMap.get(o.question_id) ?? ["", "", "", ""];
    arr[o.option_index] = o.option_text;
    optionsMap.set(o.question_id, arr);
  }

  const vocabMap = new Map<string, VocabularyItem[]>();
  for (const v of vocabRes.rows) {
    const list = vocabMap.get(v.question_id) ?? [];
    list.push({
      word: v.word,
      meaning: v.meaning_vi,
      type: v.part_of_speech ?? "",
      example: v.example_en ?? undefined,
    });
    vocabMap.set(v.question_id, list);
  }

  return qRes.map((row) =>
    rowToQuestion(row, optionsMap.get(row.question_id) ?? ["", "", "", ""], vocabMap.get(row.question_id) ?? [])
  );
}

export async function saveExerciseSet(
  client: PoolClient,
  userId: string,
  input: SaveExerciseSetInput
): Promise<{ setId: string; questionIds: string[] }> {
  const setRes = await client.query<{ id: string }>(
    `INSERT INTO exercise_sets
       (user_id, source_material_id, ai_extraction_id, title, source_type, category, difficulty, question_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      userId,
      input.sourceMaterialId ?? null,
      input.aiExtractionId ?? null,
      input.title,
      input.sourceType,
      input.category ?? null,
      input.difficulty ?? null,
      input.questions.length,
    ]
  );

  const setId = setRes.rows[0].id;
  const questionIds: string[] = [];

  for (let i = 0; i < input.questions.length; i++) {
    const q = input.questions[i];
    const qRes = await client.query<{ id: string }>(
      `INSERT INTO questions
         (exercise_set_id, sort_order, sentence, correct_index, category, topic, explanation_en, explanation_vi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        setId,
        i + 1,
        q.sentence,
        q.correctIndex,
        q.category,
        q.topic ?? null,
        q.explanation ?? null,
        q.explanationVi ?? null,
      ]
    );

    const questionId = qRes.rows[0].id;
    questionIds.push(questionId);

    for (let j = 0; j < 4; j++) {
      await client.query(
        `INSERT INTO question_options (question_id, option_index, option_text) VALUES ($1, $2, $3)`,
        [questionId, j, q.options[j]]
      );
    }

    for (const v of q.vocabulary ?? []) {
      const normalized = v.word.toLowerCase().trim();
      const pos = v.type || null;

      const existing = await client.query<{ id: string }>(
        `SELECT id FROM vocabulary
         WHERE word_normalized = $1 AND COALESCE(part_of_speech, '') = COALESCE($2, '')`,
        [normalized, pos]
      );

      let vocabId = existing.rows[0]?.id;
      if (!vocabId) {
        const vRes = await client.query<{ id: string }>(
          `INSERT INTO vocabulary (word, word_normalized, meaning_vi, part_of_speech, example_en)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [v.word, normalized, v.meaning, pos, v.example ?? null]
        );
        vocabId = vRes.rows[0].id;
      }

      await client.query(
        `INSERT INTO question_vocabulary (question_id, vocabulary_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [questionId, vocabId]
      );
    }

    await client.query(
      `INSERT INTO user_question_progress (user_id, question_id, next_review_at, mastery_level)
       VALUES ($1, $2, NOW(), 0)
       ON CONFLICT (user_id, question_id) DO NOTHING`,
      [userId, questionId]
    );
  }

  return { setId, questionIds };
}

export async function getRandomQuestionIds(
  client: PoolClient,
  userId: string,
  limit = 60
): Promise<string[]> {
  const extended = `SELECT q.id
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.is_active = TRUE
       AND COALESCE(q.part_number, es.part_number) = 5
       AND (es.user_id = $1 OR es.user_id IS NULL)
     ORDER BY RANDOM()
     LIMIT $2`;

  const legacy = `SELECT q.id
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.is_active = TRUE
       AND es.part_number = 5
       AND (es.user_id = $1 OR es.user_id IS NULL)
     ORDER BY RANDOM()
     LIMIT $2`;

  try {
    const res = await client.query<{ id: string }>(extended, [userId, limit]);
    return res.rows.map((r) => r.id);
  } catch (err) {
    if (!isMissingSchemaError(err)) throw err;
    const res = await client.query<{ id: string }>(legacy, [userId, limit]);
    return res.rows.map((r) => r.id);
  }
}

/**
 * Lấy câu hỏi theo Part. Part 5: ngẫu nhiên. Part 6/7: giữ nguyên thứ tự đoạn văn
 * (các câu cùng một đoạn nằm liền nhau theo đúng số thứ tự).
 */
export async function getQuestionIdsByPart(
  client: PoolClient,
  userId: string,
  part: number,
  limit = 60
): Promise<string[]> {
  const order =
    part === 5
      ? "ORDER BY RANDOM()"
      : "ORDER BY p.sort_order NULLS FIRST, q.sort_order";

  const extended = `SELECT q.id
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     LEFT JOIN passages p ON p.id = q.passage_id
     WHERE q.is_active = TRUE
       AND COALESCE(q.part_number, es.part_number) = $2
       AND (es.user_id = $1 OR es.user_id IS NULL)
     ${order}
     LIMIT $3`;

  const legacy = `SELECT q.id
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.is_active = TRUE
       AND es.part_number = $2
       AND (es.user_id = $1 OR es.user_id IS NULL)
     ${part === 5 ? "ORDER BY RANDOM()" : "ORDER BY q.sort_order"}
     LIMIT $3`;

  try {
    const res = await client.query<{ id: string }>(extended, [userId, part, limit]);
    return res.rows.map((r) => r.id);
  } catch (err) {
    if (!isMissingSchemaError(err)) throw err;
    const res = await client.query<{ id: string }>(legacy, [userId, part, limit]);
    return res.rows.map((r) => r.id);
  }
}

export async function countQuestionsByPart(
  client: PoolClient,
  userId: string
): Promise<Record<number, number>> {
  const extended = `SELECT COALESCE(q.part_number, es.part_number) AS part_number, COUNT(*)::text AS n
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.is_active = TRUE
       AND (es.user_id = $1 OR es.user_id IS NULL)
     GROUP BY COALESCE(q.part_number, es.part_number)`;

  const legacy = `SELECT es.part_number, COUNT(*)::text AS n
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.is_active = TRUE
       AND (es.user_id = $1 OR es.user_id IS NULL)
     GROUP BY es.part_number`;

  let rows: { part_number: number; n: string }[];
  try {
    const res = await client.query<{ part_number: number; n: string }>(extended, [userId]);
    rows = res.rows;
  } catch (err) {
    if (!isMissingSchemaError(err)) throw err;
    const res = await client.query<{ part_number: number; n: string }>(legacy, [userId]);
    rows = res.rows;
  }
  const out: Record<number, number> = {};
  for (const r of rows) out[Number(r.part_number)] = parseInt(r.n, 10);
  return out;
}

export async function countUserQuestions(
  client: PoolClient,
  userId: string
): Promise<number> {
  const extended = `SELECT COUNT(*)::text AS count
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.is_active = TRUE
       AND COALESCE(q.part_number, es.part_number) = 5
       AND (es.user_id = $1 OR es.user_id IS NULL)`;

  const legacy = `SELECT COUNT(*)::text AS count
     FROM questions q
     JOIN exercise_sets es ON es.id = q.exercise_set_id
     WHERE q.is_active = TRUE
       AND es.part_number = 5
       AND (es.user_id = $1 OR es.user_id IS NULL)`;

  try {
    const res = await client.query<{ count: string }>(extended, [userId]);
    return parseInt(res.rows[0]?.count ?? "0", 10);
  } catch (err) {
    if (!isMissingSchemaError(err)) throw err;
    const res = await client.query<{ count: string }>(legacy, [userId]);
    return parseInt(res.rows[0]?.count ?? "0", 10);
  }
}

export async function getDueQuestionIds(
  client: PoolClient,
  userId: string,
  limit = 20
): Promise<string[]> {
  const res = await client.query<{ question_id: string }>(
    `SELECT question_id FROM v_due_questions
     WHERE user_id = $1
     ORDER BY mastery_level ASC, times_wrong DESC, next_review_at ASC NULLS FIRST
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map((r) => r.question_id);
}

export async function getWeakQuestionIds(
  client: PoolClient,
  userId: string,
  limit = 20
): Promise<string[]> {
  const res = await client.query<{ question_id: string }>(
    `SELECT question_id FROM v_weak_questions
     WHERE user_id = $1
     ORDER BY times_wrong DESC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map((r) => r.question_id);
}

export async function getSetQuestionIds(
  client: PoolClient,
  setId: string
): Promise<string[]> {
  const res = await client.query<{ id: string }>(
    `SELECT id FROM questions WHERE exercise_set_id = $1 AND is_active = TRUE ORDER BY sort_order`,
    [setId]
  );
  return res.rows.map((r) => r.id);
}

export async function listExerciseSets(client: PoolClient, userId: string) {
  const res = await client.query<{
    id: string;
    title: string;
    source_type: string;
    category: string | null;
    part_number: number;
    question_count: number;
    created_at: string;
  }>(
    `SELECT id, title, source_type, category, part_number, question_count, created_at
     FROM exercise_sets
     WHERE user_id = $1 OR user_id IS NULL
     ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows;
}

export async function getProgressStats(client: PoolClient, userId: string) {
  const res = await client.query<{
    total: string;
    due: string;
    weak: string;
    mastered: string;
  }>(
    `SELECT
       COUNT(*)::text AS total,
       COUNT(*) FILTER (WHERE mastery_level < 3 AND (next_review_at IS NULL OR next_review_at <= NOW()))::text AS due,
       COUNT(*) FILTER (WHERE times_wrong > 0 AND mastery_level < 3)::text AS weak,
       COUNT(*) FILTER (WHERE mastery_level >= 3)::text AS mastered
     FROM user_question_progress WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0];
}
