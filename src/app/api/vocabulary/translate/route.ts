import { NextRequest, NextResponse } from "next/server";
import { generateWithOpenAi, resolveApiKey, resolveModelId } from "@/lib/openai-client";
import { query } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";

function buildPrompt(word: string, context?: string): string {
  const ctx = context ? `\nIt appears in this sentence: "${context}"` : "";
  return `You are a TOEIC vocabulary tutor for a Vietnamese learner. Give the meaning of the English word or phrase "${word}".${ctx}

Return ONLY valid JSON (no markdown, no code fences) in this exact shape:
{
  "meaning": "nghĩa tiếng Việt ngắn gọn",
  "type": "part of speech in English (noun/verb/adjective/adverb/phrase)",
  "example": "a short, simple English example sentence using the word"
}`;
}

// Dịch nghĩa từ bằng AI (best-effort). Body: { word, context?, vocabularyId? }
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const word = String(body.word ?? "").trim();
    if (!word) {
      return NextResponse.json({ error: "Thiếu từ" }, { status: 400 });
    }

    let apiKey: string;
    try {
      apiKey = resolveApiKey(
        request.headers.get("x-openai-api-key") ||
          request.headers.get("x-cursor-api-key")
      );
    } catch {
      return NextResponse.json(
        { ok: false, error: "Chưa có OpenAI API key — tự nhập nghĩa giúp nhé." },
        { status: 200 }
      );
    }

    const modelId = resolveModelId(undefined);

    const parsed = (await generateWithOpenAi(
      buildPrompt(word, body.context ? String(body.context) : undefined),
      apiKey,
      modelId
    )) as Record<string, unknown>;

    const meaning = String(parsed.meaning ?? "").trim();
    const type = parsed.type ? String(parsed.type) : null;
    const example = parsed.example ? String(parsed.example) : null;

    if (!meaning) {
      return NextResponse.json({ ok: false, error: "AI không trả về nghĩa" }, { status: 200 });
    }

    // Lưu nghĩa vào DB nếu có vocabularyId
    if (body.vocabularyId) {
      await query(
        `UPDATE vocabulary SET meaning_vi = $2,
           part_of_speech = COALESCE(NULLIF(part_of_speech, ''), $3),
           example_en = COALESCE(NULLIF(example_en, ''), $4)
         WHERE id = $1`,
        [String(body.vocabularyId), meaning, type, example]
      );
    }

    return NextResponse.json({ ok: true, meaning, type, example });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // Không chặn người dùng — trả về 200 để họ tự nhập nghĩa
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
