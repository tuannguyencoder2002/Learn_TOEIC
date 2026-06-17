import type { PoolClient } from "pg";
import { computeSrsUpdate } from "../srs";

export async function createPracticeSession(
  client: PoolClient,
  userId: string,
  sessionType: string,
  exerciseSetId?: string
): Promise<string> {
  const res = await client.query<{ id: string }>(
    `INSERT INTO practice_sessions (user_id, session_type, exercise_set_id)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, sessionType, exerciseSetId ?? null]
  );
  return res.rows[0].id;
}

export async function recordAnswer(
  client: PoolClient,
  params: {
    userId: string;
    sessionId: string;
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
    timeSpentMs?: number;
  }
) {
  await client.query(
    `INSERT INTO practice_answers (session_id, question_id, selected_index, is_correct, time_spent_ms)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      params.sessionId,
      params.questionId,
      params.selectedIndex,
      params.isCorrect,
      params.timeSpentMs ?? null,
    ]
  );

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
     FROM user_question_progress
     WHERE user_id = $1 AND question_id = $2`,
    [params.userId, params.questionId]
  );

  const prev = prevRes.rows[0];
  const base = prev ?? {
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
    params.isCorrect
  );

  await client.query(
    `INSERT INTO user_question_progress
       (user_id, question_id, times_seen, times_correct, times_wrong,
        consecutive_correct, mastery_level, ease_factor, interval_days,
        next_review_at, last_practiced_at, last_wrong_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
     ON CONFLICT (user_id, question_id) DO UPDATE SET
       times_seen = EXCLUDED.times_seen,
       times_correct = EXCLUDED.times_correct,
       times_wrong = EXCLUDED.times_wrong,
       consecutive_correct = EXCLUDED.consecutive_correct,
       mastery_level = EXCLUDED.mastery_level,
       ease_factor = EXCLUDED.ease_factor,
       interval_days = EXCLUDED.interval_days,
       next_review_at = EXCLUDED.next_review_at,
       last_practiced_at = NOW(),
       last_wrong_at = CASE WHEN $12 = FALSE THEN NOW() ELSE user_question_progress.last_wrong_at END,
       updated_at = NOW()`,
    [
      params.userId,
      params.questionId,
      srs.timesSeen,
      srs.timesCorrect,
      srs.timesWrong,
      srs.consecutiveCorrect,
      srs.masteryLevel,
      srs.easeFactor,
      srs.intervalDays,
      srs.nextReviewAt,
      params.isCorrect ? null : new Date(),
      params.isCorrect,
    ]
  );
}

export async function finishSession(
  client: PoolClient,
  sessionId: string,
  totalQuestions: number,
  correctCount: number
) {
  await client.query(
    `UPDATE practice_sessions
     SET total_questions = $2, correct_count = $3, finished_at = NOW()
     WHERE id = $1`,
    [sessionId, totalQuestions, correctCount]
  );
}
