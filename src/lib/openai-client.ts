import { parseAiJson } from "./extract-json";
import type { CursorModel } from "./types";

const OPENAI_API_BASE = "https://api.openai.com/v1";

export function resolveApiKey(headerKey?: string | null): string {
  const key = headerKey?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Thiếu OpenAI API key. Thêm vào Settings hoặc OPENAI_API_KEY trong .env.local"
    );
  }
  return key;
}

export function resolveModelId(modelId?: string): string {
  const id = modelId?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  if (id === "auto") return "gpt-4o-mini";
  return id;
}

export function getDefaultModels(): CursorModel[] {
  return [
    { id: "gpt-4o-mini", displayName: "GPT-4o mini (nhanh, rẻ)" },
    { id: "gpt-4o", displayName: "GPT-4o" },
    { id: "gpt-4.1-mini", displayName: "GPT-4.1 mini" },
    { id: "gpt-4.1", displayName: "GPT-4.1" },
  ];
}

export async function listOpenAiModels(apiKey: string): Promise<CursorModel[]> {
  const res = await fetch(`${OPENAI_API_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    throw parseOpenAiError(res.status, await res.text());
  }

  return getDefaultModels();
}

function parseOpenAiError(status: number, errText: string): Error {
  try {
    const parsed = JSON.parse(errText) as {
      error?: { message?: string; type?: string; code?: string };
    };
    const message = parsed.error?.message ?? errText;
    if (status === 401) {
      return new Error(`OpenAI API key không hợp lệ: ${message}`);
    }
    return new Error(`OpenAI API ${status}: ${message}`);
  } catch {
    return new Error(`OpenAI API ${status}: ${errText}`);
  }
}

type OpenAiImage = { mimeType: string; data: string };

export async function generateWithOpenAi(
  prompt: string,
  apiKey: string,
  modelId?: string,
  images?: OpenAiImage[]
): Promise<unknown> {
  const model = resolveModelId(modelId);

  const userContent =
    images?.length ?
      [
        { type: "text" as const, text: prompt },
        ...images.map((img) => ({
          type: "image_url" as const,
          image_url: {
            url: `data:${img.mimeType};base64,${img.data}`,
          },
        })),
      ]
    : prompt;

  const res = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: userContent }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw parseOpenAiError(res.status, await res.text());
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) {
    throw new Error("OpenAI không trả về nội dung");
  }

  return parseAiJson(text);
}
