import { NextRequest, NextResponse } from "next/server";
import { getDefaultUserId, withTransaction } from "@/lib/db";
import {
  countQuestionsByPart,
  countUserQuestions,
  getDueQuestionIds,
  getProgressStats,
  getQuestionIdsByPart,
  getRandomQuestionIds,
  getSetQuestionIds,
  getWeakQuestionIds,
  listExerciseSets,
  loadQuestionDetails,
} from "@/lib/repositories/questions";
import { clampPracticeCount, PRACTICE_SESSION } from "@/lib/practice-config";import {
  createPracticeSession,
  finishSession,
  recordAnswer,
} from "@/lib/repositories/progress";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "stats";

    if (action === "stats") {
      const stats = await withTransaction(async (client) => {
        const userId = await getDefaultUserId(client);
        return getProgressStats(client, userId);
      });
      return NextResponse.json({ stats });
    }

    if (action === "sets") {
      const sets = await withTransaction(async (client) => {
        const userId = await getDefaultUserId(client);
        return listExerciseSets(client, userId);
      });
      return NextResponse.json({ sets });
    }

    if (action === "counts") {
      const counts = await withTransaction(async (client) => {
        const userId = await getDefaultUserId(client);
        return countQuestionsByPart(client, userId);
      });
      return NextResponse.json({ counts });
    }

    if (action === "bank") {
      const part = parseInt(searchParams.get("part") ?? "5", 10);
      const rawLimit = parseInt(searchParams.get("limit") ?? "60", 10);
      // Part 6/7 đề ít hơn nên không ép tối thiểu 50 như marathon Part 5.
      const limit = Math.min(100, Math.max(1, rawLimit));

      const result = await withTransaction(async (client) => {
        const userId = await getDefaultUserId(client);
        const questionIds = await getQuestionIdsByPart(client, userId, part, limit);
        const questions = await loadQuestionDetails(client, questionIds);
        return { questions, part, requested: limit, available: questions.length };
      });

      return NextResponse.json(result);
    }

    if (action === "marathon") {
      const rawLimit = parseInt(searchParams.get("limit") ?? String(PRACTICE_SESSION.default), 10);
      const limit = clampPracticeCount(rawLimit);

      const result = await withTransaction(async (client) => {
        const userId = await getDefaultUserId(client);
        const totalInDb = await countUserQuestions(client, userId);
        const questionIds = await getRandomQuestionIds(client, userId, limit);
        const questions = await loadQuestionDetails(client, questionIds);

        return {
          questions,
          requested: limit,
          availableInDb: totalInDb,
        };
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = body.mode as "due" | "weak" | "set";
    const setId = body.setId as string | undefined;
    const limit = clampPracticeCount(body.limit ?? PRACTICE_SESSION.default);
    const result = await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);
      let questionIds: string[] = [];
      let sessionType = "review";

      if (mode === "due") {
        questionIds = await getDueQuestionIds(client, userId, limit);
        sessionType = "review";
      } else if (mode === "weak") {
        questionIds = await getWeakQuestionIds(client, userId, limit);
        sessionType = "weak_points";
      } else if (mode === "set" && setId) {
        questionIds = await getSetQuestionIds(client, setId);
        sessionType = "set_practice";
      } else {
        throw new Error("mode không hợp lệ");
      }

      if (questionIds.length === 0) {
        return { sessionId: null, questions: [], message: "Không có câu cần ôn" };
      }

      const sessionId = await createPracticeSession(
        client,
        userId,
        sessionType,
        setId
      );
      const questions = await loadQuestionDetails(client, questionIds);

      return { sessionId, questions, mode };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, selectedIndex, timeSpentMs, finish } = body;

    if (!sessionId || !questionId || selectedIndex === undefined) {
      return NextResponse.json({ error: "Thiếu tham số" }, { status: 400 });
    }

    const result = await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);
      const qRes = await client.query<{ correct_index: number }>(
        `SELECT correct_index FROM questions WHERE id = $1`,
        [questionId]
      );
      const correctIndex = qRes.rows[0]?.correct_index;
      if (correctIndex === undefined) throw new Error("Không tìm thấy câu hỏi");

      const isCorrect = selectedIndex === correctIndex;

      await recordAnswer(client, {
        userId,
        sessionId,
        questionId,
        selectedIndex,
        isCorrect,
        timeSpentMs,
      });

      if (finish) {
        const stats = await client.query<{ total: string; correct: string }>(
          `SELECT COUNT(*)::text AS total,
                  COUNT(*) FILTER (WHERE is_correct)::text AS correct
           FROM practice_answers WHERE session_id = $1`,
          [sessionId]
        );
        await finishSession(
          client,
          sessionId,
          parseInt(stats.rows[0].total, 10),
          parseInt(stats.rows[0].correct, 10)
        );
      }

      return { isCorrect, correctIndex };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
