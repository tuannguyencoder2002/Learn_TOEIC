import { NextResponse } from "next/server";
import { getDefaultUserId, query } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const res = await query<{
      word: string;
      meaning_vi: string;
      part_of_speech: string | null;
      example_en: string | null;
      mastery_level: number | null;
      times_wrong: number | null;
    }>(
      `SELECT v.word, v.meaning_vi, v.part_of_speech, v.example_en,
              uvp.mastery_level, uqp.times_wrong
       FROM vocabulary v
       LEFT JOIN user_vocabulary_progress uvp
         ON uvp.vocabulary_id = v.id AND uvp.user_id = $1
       LEFT JOIN question_vocabulary qv ON qv.vocabulary_id = v.id
       LEFT JOIN user_question_progress uqp
         ON uqp.question_id = qv.question_id AND uqp.user_id = $1
       GROUP BY v.id, v.word, v.meaning_vi, v.part_of_speech, v.example_en, uvp.mastery_level
       ORDER BY v.word`,
      [userId]
    );

    return NextResponse.json({ vocabulary: res.rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message, vocabulary: [] }, { status: 500 });
  }
}
