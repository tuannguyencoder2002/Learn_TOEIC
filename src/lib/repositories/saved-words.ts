import type { PoolClient } from "pg";
import { computeSrsUpdate } from "../srs";

export interface SavedWordRow {
  vocabulary_id: string;
  word: string;
  meaning_vi: string | null;
  part_of_speech: string | null;
  example_en: string | null;
  context_en: string | null;
  note: string | null;
  mastery_level: number;
  times_seen: number;
  times_correct: number;
  next_review_at: string | null;
  is_due: boolean;
}

function normalize(word: string) {
  return word.toLowerCase().trim();
}

/** Tìm hoặc tạo từ trong bảng vocabulary (theo word_normalized). */
async function findOrCreateVocab(
  client: PoolClient,
  word: string,
  meaning: string | null,
  pos: string | null,
  example: string | null
): Promise<string> {
  const normalized = normalize(word);
  const existing = await client.query<{ id: string; meaning_vi: string | null }>(
    `SELECT id, meaning_vi FROM vocabulary
     WHERE word_normalized = $1
     ORDER BY (meaning_vi IS NOT NULL AND meaning_vi <> '') DESC
     LIMIT 1`,
    [normalized]
  );

  if (existing.rows[0]) {
    const row = existing.rows[0];
    // Bổ sung nghĩa nếu trước đó trống mà giờ có
    if (meaning && (!row.meaning_vi || row.meaning_vi.trim() === "")) {
      await client.query(`UPDATE vocabulary SET meaning_vi = $2 WHERE id = $1`, [
        row.id,
        meaning,
      ]);
    }
    return row.id;
  }

  const ins = await client.query<{ id: string }>(
    `INSERT INTO vocabulary (word, word_normalized, meaning_vi, part_of_speech, example_en)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [word.trim(), normalized, meaning ?? "", pos, example]
  );
  return ins.rows[0].id;
}

/** Lưu (star) một từ người dùng bôi đen vào danh sách cần ôn — đến hạn ngay. */
export async function saveWord(
  client: PoolClient,
  userId: string,
  params: {
    word: string;
    meaning?: string | null;
    partOfSpeech?: string | null;
    example?: string | null;
    context?: string | null;
  }
): Promise<{ vocabularyId: string }> {
  const vocabularyId = await findOrCreateVocab(
    client,
    params.word,
    params.meaning ?? null,
    params.partOfSpeech ?? null,
    params.example ?? null
  );

  await client.query(
    `INSERT INTO user_vocabulary_progress
       (user_id, vocabulary_id, is_starred, context_en, next_review_at, mastery_level)
     VALUES ($1, $2, TRUE, $3, NOW(), 0)
     ON CONFLICT (user_id, vocabulary_id) DO UPDATE SET
       is_starred = TRUE,
       context_en = COALESCE(EXCLUDED.context_en, user_vocabulary_progress.context_en),
       next_review_at = LEAST(user_vocabulary_progress.next_review_at, NOW()),
       updated_at = NOW()`,
    [userId, vocabularyId, params.context ?? null]
  );

  return { vocabularyId };
}

export async function listSavedWords(
  client: PoolClient,
  userId: string,
  dueOnly = false
): Promise<SavedWordRow[]> {
  const res = await client.query<SavedWordRow>(
    `SELECT v.id AS vocabulary_id, v.word, v.meaning_vi, v.part_of_speech, v.example_en,
            uvp.context_en, uvp.note, uvp.mastery_level, uvp.times_seen, uvp.times_correct,
            uvp.next_review_at,
            (uvp.next_review_at IS NULL OR uvp.next_review_at <= NOW()) AS is_due
     FROM user_vocabulary_progress uvp
     JOIN vocabulary v ON v.id = uvp.vocabulary_id
     WHERE uvp.user_id = $1 AND uvp.is_starred = TRUE
       ${dueOnly ? "AND uvp.mastery_level < 3 AND (uvp.next_review_at IS NULL OR uvp.next_review_at <= NOW())" : ""}
     ORDER BY is_due DESC, uvp.next_review_at ASC NULLS FIRST, v.word ASC`,
    [userId]
  );
  return res.rows;
}

export async function countDueSavedWords(
  client: PoolClient,
  userId: string
): Promise<{ total: number; due: number }> {
  const res = await client.query<{ total: string; due: string }>(
    `SELECT COUNT(*)::text AS total,
            COUNT(*) FILTER (
              WHERE mastery_level < 3 AND (next_review_at IS NULL OR next_review_at <= NOW())
            )::text AS due
     FROM user_vocabulary_progress
     WHERE user_id = $1 AND is_starred = TRUE`,
    [userId]
  );
  return {
    total: parseInt(res.rows[0]?.total ?? "0", 10),
    due: parseInt(res.rows[0]?.due ?? "0", 10),
  };
}

/** Ôn một từ: remembered=true -> nhớ, false -> chưa nhớ. Cập nhật SRS. */
export async function reviewSavedWord(
  client: PoolClient,
  userId: string,
  vocabularyId: string,
  remembered: boolean
): Promise<void> {
  const prevRes = await client.query<{
    times_seen: number;
    times_correct: number;
    times_wrong: number;
    consecutive_correct: number;
    mastery_level: number;
    ease_factor: string;
    interval_days: number;
  }>(
    `SELECT times_seen, times_correct, times_wrong, consecutive_correct,
            mastery_level, ease_factor, interval_days
     FROM user_vocabulary_progress
     WHERE user_id = $1 AND vocabulary_id = $2`,
    [userId, vocabularyId]
  );

  const base = prevRes.rows[0] ?? {
    times_seen: 0,
    times_correct: 0,
    times_wrong: 0,
    consecutive_correct: 0,
    mastery_level: 0,
    ease_factor: "2.50",
    interval_days: 0,
  };

  const srs = computeSrsUpdate(
    {
      timesSeen: base.times_seen,
      timesCorrect: base.times_correct,
      timesWrong: base.times_wrong,
      consecutiveCorrect: base.consecutive_correct,
      masteryLevel: base.mastery_level,
      easeFactor: parseFloat(base.ease_factor),
      intervalDays: base.interval_days,
    },
    remembered
  );

  await client.query(
    `UPDATE user_vocabulary_progress SET
       times_seen = $3,
       times_correct = $4,
       times_wrong = $5,
       consecutive_correct = $6,
       mastery_level = $7,
       ease_factor = $8,
       interval_days = $9,
       next_review_at = $10,
       last_reviewed_at = NOW(),
       updated_at = NOW()
     WHERE user_id = $1 AND vocabulary_id = $2`,
    [
      userId,
      vocabularyId,
      srs.timesSeen,
      srs.timesCorrect,
      srs.timesWrong,
      srs.consecutiveCorrect,
      srs.masteryLevel,
      srs.easeFactor,
      srs.intervalDays,
      srs.nextReviewAt,
    ]
  );
}

/** Bỏ lưu một từ (xóa khỏi danh sách cần ôn). */
export async function unsaveWord(
  client: PoolClient,
  userId: string,
  vocabularyId: string
): Promise<void> {
  await client.query(
    `UPDATE user_vocabulary_progress SET is_starred = FALSE, updated_at = NOW()
     WHERE user_id = $1 AND vocabulary_id = $2`,
    [userId, vocabularyId]
  );
}

/** Cập nhật nghĩa / ghi chú do người dùng tự nhập. */
export async function updateSavedWordMeaning(
  client: PoolClient,
  userId: string,
  vocabularyId: string,
  meaning?: string | null,
  note?: string | null
): Promise<void> {
  if (meaning !== undefined) {
    await client.query(`UPDATE vocabulary SET meaning_vi = $2 WHERE id = $1`, [
      vocabularyId,
      meaning ?? "",
    ]);
  }
  if (note !== undefined) {
    await client.query(
      `UPDATE user_vocabulary_progress SET note = $3, updated_at = NOW()
       WHERE user_id = $1 AND vocabulary_id = $2`,
      [userId, vocabularyId, note ?? null]
    );
  }
}
