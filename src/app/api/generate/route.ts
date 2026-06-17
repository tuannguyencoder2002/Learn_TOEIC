import { NextRequest, NextResponse } from "next/server";
import { clampPracticeCount, PRACTICE_SESSION } from "@/lib/practice-config";
import { generateWithCursor, resolveApiKey } from "@/lib/cursor-client";
import { buildGeneratePrompt } from "@/lib/prompts";import type {
  GenerateQuizRequest,
  QuestionCategory,
  QuizSet,
  ToeicQuestion,
} from "@/lib/types";

const VALID_CATEGORIES = new Set<QuestionCategory>([
  "word_form",
  "grammar",
  "vocabulary",
  "collocation",
]);

function normalizeQuestion(raw: Record<string, unknown>, index: number): ToeicQuestion {
  const options = raw.options as string[];
  if (!Array.isArray(options) || options.length !== 4) {
    throw new Error(`Câu ${index + 1}: cần đúng 4 đáp án`);
  }

  const correctIndex = Number(raw.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    throw new Error(`Câu ${index + 1}: correctIndex phải từ 0-3`);
  }

  const category = raw.category as QuestionCategory;
  if (!VALID_CATEGORIES.has(category)) {
    throw new Error(`Câu ${index + 1}: category không hợp lệ`);
  }

  const vocabulary = Array.isArray(raw.vocabulary)
    ? raw.vocabulary.map((v: Record<string, string>) => ({
        word: String(v.word ?? ""),
        meaning: String(v.meaning ?? ""),
        type: String(v.type ?? ""),
        example: v.example ? String(v.example) : undefined,
      }))
    : [];

  return {
    id: String(raw.id ?? `ai-${Date.now()}-${index}`),
    sentence: String(raw.sentence ?? ""),
    options: options as [string, string, string, string],
    correctIndex: correctIndex as 0 | 1 | 2 | 3,
    category,
    topic: String(raw.topic ?? ""),
    explanation: String(raw.explanation ?? ""),
    explanationVi: raw.explanationVi ? String(raw.explanationVi) : undefined,
    vocabulary,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateQuizRequest;
    const apiKey = resolveApiKey(
      body.apiKey || request.headers.get("x-cursor-api-key")
    );
    const modelId = body.modelId || process.env.CURSOR_MODEL || "auto";
    const mode =
      (process.env.CURSOR_AGENT_MODE as "local" | "cloud" | "auto") || "auto";

    const total = clampPracticeCount(body.count ?? PRACTICE_SESSION.default);
    const chunkSize = PRACTICE_SESSION.aiChunkSize;
    const allQuestions: ToeicQuestion[] = [];
    let title = "Đề Part 5 do AI tạo";

    const chunks = Math.ceil(total / chunkSize);
    for (let i = 0; i < chunks; i++) {
      const remaining = total - allQuestions.length;
      const batchCount = Math.min(chunkSize, remaining);
      const prompt = buildGeneratePrompt(
        { ...body, count: batchCount },
        { batch: i + 1, totalBatches: chunks }
      );

      const parsed = (await generateWithCursor(
        prompt,
        apiKey,
        modelId,
        mode
      )) as Record<string, unknown>;

      if (parsed.title && i === 0) {
        title = String(parsed.title);
      }

      const rawQuestions = parsed.questions;
      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        if (allQuestions.length === 0) {
          throw new Error("AI không trả về câu hỏi nào");
        }
        break;
      }

      const batch = rawQuestions.map((q, idx) =>
        normalizeQuestion(q as Record<string, unknown>, allQuestions.length + idx)
      );
      allQuestions.push(...batch);
    }

    const questions = allQuestions.slice(0, total);

    const quiz: QuizSet = {
      id: `ai-${Date.now()}`,
      title: `${title} (${questions.length} câu)`,
      source: "ai",
      createdAt: new Date().toISOString(),
      questions,
    };

    return NextResponse.json({ quiz });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}