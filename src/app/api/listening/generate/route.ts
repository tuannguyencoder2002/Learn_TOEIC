import { NextRequest, NextResponse } from "next/server";
import { generateWithOpenAi, resolveApiKey, resolveModelId } from "@/lib/openai-client";
import { buildListeningPracticePrompt } from "@/lib/prompts-listening";
import { readJsonBody } from "@/lib/request-body";

interface GenBody {
  part?: number;
  theme?: string;
  apiKey?: string;
  modelId?: string;
}

interface ListeningQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanationVi?: string;
}

function normalizeQuestion(raw: Record<string, unknown>, i: number): ListeningQuestion {
  const options = Array.isArray(raw.options) ? raw.options.map((o) => String(o)) : [];
  while (options.length < 4) options.push("");
  let correctIndex = Number(raw.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    correctIndex = 0;
  }
  return {
    question: String(raw.question ?? `Câu ${i + 1}`),
    options: options.slice(0, 4),
    correctIndex,
    explanationVi: raw.explanationVi ? String(raw.explanationVi) : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody<GenBody>(request);
    const part = [1, 2, 3, 4].includes(Number(body.part)) ? Number(body.part) : 3;
    const apiKey = resolveApiKey(body.apiKey || request.headers.get("x-openai-api-key"));
    const modelId = resolveModelId(body.modelId);

    const prompt = buildListeningPracticePrompt(part, body.theme);
    const parsed = (await generateWithOpenAi(prompt, apiKey, modelId)) as Record<
      string,
      unknown
    >;

    const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    if (rawQuestions.length === 0) {
      throw new Error("AI không trả về câu hỏi nào");
    }

    const result = {
      title: String(parsed.title ?? `Bài nghe Part ${part}`),
      partNumber: part,
      transcript: String(parsed.transcript ?? ""),
      questions: rawQuestions.map((q, i) => normalizeQuestion(q as Record<string, unknown>, i)),
      vocab: Array.isArray(parsed.vocab)
        ? parsed.vocab.map((v: Record<string, unknown>) => ({
            word: String(v.word ?? ""),
            ipa: v.ipa ? String(v.ipa) : undefined,
            meaningVi: String(v.meaningVi ?? v.meaning ?? ""),
            exampleEn: v.exampleEn ? String(v.exampleEn) : undefined,
          }))
        : [],
    };

    return NextResponse.json({ practice: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
