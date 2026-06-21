import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { Agent, Cursor, CursorAgentError } from "@cursor/sdk";
import { buildImageExtractPrompt } from "./prompts-image";
import { parseAiJson } from "./extract-json";
import type { CursorModel } from "./types";

const CURSOR_API_BASE = "https://api.cursor.com";

export function resolveAgentMode(): "local" | "cloud" | "auto" {
  const mode = process.env.CURSOR_AGENT_MODE?.trim();
  if (mode === "local" || mode === "cloud" || mode === "auto") return mode;
  return "local";
}

export function resolveApiKey(headerKey?: string | null): string {
  const key = headerKey?.trim() || process.env.CURSOR_API_KEY?.trim();
  if (!key) {
    throw new Error("Thiếu Cursor API key. Thêm vào Settings hoặc file .env.local");
  }
  return key;
}

export async function listCursorModels(apiKey: string): Promise<CursorModel[]> {
  try {
    const models = await Cursor.models.list({ apiKey });
    return models.map((m) => ({
      id: m.id,
      displayName: m.displayName ?? m.id,
      description: m.description,
    }));
  } catch {
    return getFallbackModels();
  }
}

function getFallbackModels(): CursorModel[] {
  return [
    { id: "composer-2.5", displayName: "Composer 2.5" },
    { id: "claude-4.6-sonnet-medium-thinking", displayName: "Claude 4.6 Sonnet" },
    { id: "claude-4.6-opus-high-thinking", displayName: "Claude 4.6 Opus" },
    { id: "gpt-5.3-codex", displayName: "GPT 5.3 Codex" },
    { id: "auto", displayName: "Auto (Cursor chọn)" },
  ];
}

function resolveModelId(modelId: string): string {
  return modelId || "auto";
}

function isStorageModeError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("feature_unavailable") ||
    msg.includes("Storage mode is disabled") ||
    msg.includes("Privacy Mode")
  );
}

function isCloudEnvironmentError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("environment_public_id") ||
    msg.includes("environment is invalid")
  );
}

function cloudEnvironmentHelpError(): Error {
  return new Error(
    "Cloud Agent chưa được cấu hình cho tài khoản này.\n" +
      "Cách xử lý (chọn một):\n" +
      "1) Dùng Local Agent: cài Cursor Desktop trên máy, thêm CURSOR_AGENT_MODE=local vào .env.local rồi khởi động lại app.\n" +
      "2) Hoặc cấu hình Cloud Agent tại cursor.com/dashboard/cloud-agents (gắn GitHub repo).\n" +
      "Tạo đề Part 5 không cần Cloud — Local Agent là đủ."
  );
}

function localAgentHelpError(cause?: unknown): Error {
  const detail = cause instanceof Error ? cause.message : "";
  return new Error(
    "Local Agent không chạy được trên máy này.\n" +
      "Cài Cursor Desktop (cursor.com/download), mở app ít nhất một lần, rồi đặt CURSOR_AGENT_MODE=local trong .env.local.\n" +
      (detail ? `Chi tiết: ${detail}` : "")
  );
}

function storageModeHelpError(): Error {
  return new Error(
    "Cursor Cloud Agent chưa bật Storage. Cách xử lý:\n" +
      "1) Vào cursor.com/settings → General → chọn Privacy Mode (KHÔNG dùng Legacy/Ghost).\n" +
      "2) Hoặc cài Cursor Desktop + CLI trên máy này để app dùng Local Agent (không cần Cloud).\n" +
      "3) Khởi động lại app sau khi đổi cài đặt."
  );
}

function parseCursorApiError(status: number, errText: string): Error {
  try {
    const parsed = JSON.parse(errText) as {
      error?: { code?: string; message?: string };
    };
    const code = parsed.error?.code;
    const message = parsed.error?.message ?? "";

    if (code === "feature_unavailable" && message.includes("Storage mode")) {
      return storageModeHelpError();
    }

    if (
      code === "validation_error" &&
      message.includes("environment_public_id")
    ) {
      return cloudEnvironmentHelpError();
    }

    if (status === 403) {
      return new Error(`Cursor API từ chối (403): ${message || errText}`);
    }
  } catch {
    // fall through
  }

  return new Error(`Cursor API ${status}: ${errText}`);
}

type CursorImage = { mimeType: string; data: string };

async function withTempImportDir<T>(fn: (tempCwd: string) => Promise<T>): Promise<T> {
  const tempCwd = await mkdtemp(join(tmpdir(), "toeic-import-"));
  try {
    return await fn(tempCwd);
  } finally {
    await rm(tempCwd, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function promptWithLocalAgentFast(
  prompt: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  return withTempImportDir(async (tempCwd) => {
    const resolvedModel = resolveModelId(modelId);
    const result = await Agent.prompt(prompt, {
      apiKey,
      model: { id: resolvedModel },
      local: { cwd: tempCwd, settingSources: [] },
    });

    if (result.status === "error") {
      throw new Error("Local agent thất bại. Kiểm tra Cursor Desktop/CLI đã cài trên máy.");
    }

    return result.result ?? "";
  });
}

async function promptWithLocalAgent(
  prompt: string,
  apiKey: string,
  modelId: string,
  images?: CursorImage[],
  forImport = false
): Promise<string> {
  const resolvedModel = resolveModelId(modelId);

  const runAgent = async (tempCwd: string) => {
    const agent = await Agent.create({
      apiKey,
      model: { id: resolvedModel },
      local: {
        cwd: tempCwd,
        settingSources: [],
      },
      name: "Learn TOEIC Import",
    });

    try {
      const message =
        images?.length ?
          {
            text: prompt,
            images: images.map((img) => ({
              data: img.data,
              mimeType: img.mimeType,
            })),
          }
        : prompt;

      const run = await agent.send(message);
      const result = await run.wait();

      if (result.status === "error") {
        throw new Error("Local agent thất bại. Kiểm tra Cursor Desktop/CLI đã cài trên máy.");
      }

      return result.result ?? "";
    } catch (err) {
      if (err instanceof CursorAgentError) {
        throw new Error(`Cursor Local Agent: ${err.message}`);
      }
      throw err;
    } finally {
      agent.close();
    }
  };

  if (forImport || images?.length) {
    return withTempImportDir(runAgent);
  }

  return runAgent(process.cwd());
}

async function promptWithCloudAgent(
  prompt: string,
  apiKey: string,
  modelId: string,
  images?: CursorImage[],
  forImport = false
): Promise<string> {
  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const cloudModel = resolveModelId(modelId);

  const createRes = await fetch(`${CURSOR_API_BASE}/v1/agents`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: {
        text: prompt,
        images: images?.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
        })),
      },
      model: cloudModel === "auto" ? undefined : { id: cloudModel },
      name: "Learn TOEIC Import",
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw parseCursorApiError(createRes.status, errText);
  }

  const created = (await createRes.json()) as {
    agent: { id: string };
    run: { id: string };
  };

  const agentId = created.agent.id;
  const runId = created.run.id;

  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(pollDelayMs(i));

    const runRes = await fetch(
      `${CURSOR_API_BASE}/v1/agents/${agentId}/runs/${runId}`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    if (!runRes.ok) continue;

    const run = (await runRes.json()) as {
      status: string;
      result?: string;
    };

    if (run.status === "FINISHED" && run.result) {
      return run.result;
    }
    if (run.status === "ERROR" || run.status === "CANCELLED") {
      throw new Error(`Cloud agent dừng với trạng thái: ${run.status}`);
    }
  }

  throw new Error("Hết thời gian chờ AI đọc ảnh. Thử lại hoặc chọn model nhanh hơn.");
}

function pollDelayMs(attempt: number): number {
  if (attempt < 8) return 600;
  if (attempt < 20) return 1200;
  return 2000;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractImagesPerPageParallel(
  apiKey: string,
  modelId: string,
  images: CursorImage[]
): Promise<string> {
  const pagePrompt = buildImageExtractPrompt(1);
  const chunks = await Promise.all(
    images.map((img) =>
      promptWithLocalAgent(pagePrompt, apiKey, modelId, [img], true)
    )
  );
  return mergeJsonResponses(chunks);
}

async function promptWithImages(
  prompt: string,
  apiKey: string,
  modelId: string,
  images: CursorImage[],
  mode: "local" | "cloud" | "auto"
): Promise<string> {
  const tryLocalBatch = () =>
    promptWithLocalAgent(prompt, apiKey, modelId, images, true);
  const tryCloudBatch = () =>
    promptWithCloudAgent(prompt, apiKey, modelId, images, true);

  if (mode === "local") {
    if (images.length > 1) {
      try {
        return await tryLocalBatch();
      } catch {
        return extractImagesPerPageParallel(apiKey, modelId, images);
      }
    }
    return tryLocalBatch();
  }

  if (mode === "cloud") return tryCloudBatch();

  try {
    return await tryLocalBatch();
  } catch (localErr) {
    try {
      return await tryCloudBatch();
    } catch (cloudErr) {
      if (isStorageModeError(cloudErr) && images.length >= 1) {
        try {
          if (images.length === 1) {
            return promptWithLocalAgent(
              buildImageExtractPrompt(1),
              apiKey,
              modelId,
              images,
              true
            );
          }
          return await extractImagesPerPageParallel(apiKey, modelId, images);
        } catch {
          throw storageModeHelpError();
        }
      }

      if (isStorageModeError(cloudErr)) {
        throw storageModeHelpError();
      }

      if (isCloudEnvironmentError(cloudErr)) {
        throw cloudEnvironmentHelpError();
      }

      throw localErr instanceof Error ? localErr : cloudErr;
    }
  }
}

function mergeJsonResponses(chunks: string[]): string {
  const merged: Record<string, unknown> = {
    title: "",
    reviewSummaryVi: "",
    category: "mixed",
    questions: [] as unknown[],
  };

  for (const chunk of chunks) {
    const parsed = parseAiJson(chunk) as Record<string, unknown>;
    if (!merged.title && parsed.title) merged.title = parsed.title;
    if (parsed.reviewSummaryVi) {
      merged.reviewSummaryVi = merged.reviewSummaryVi ?
        `${merged.reviewSummaryVi} ${parsed.reviewSummaryVi}`
      : parsed.reviewSummaryVi;
    }
    if (Array.isArray(parsed.questions)) {
      (merged.questions as unknown[]).push(...parsed.questions);
    }
  }

  return JSON.stringify(merged);
}

export async function generateWithCursor(
  prompt: string,
  apiKey: string,
  modelId = "auto",
  mode: "local" | "cloud" | "auto" = "auto",
  images?: CursorImage[]
): Promise<unknown> {
  let text = "";

  if (images?.length) {
    text = await promptWithImages(prompt, apiKey, modelId, images, mode);
  } else if (mode === "cloud") {
    text = await promptWithCloudAgent(prompt, apiKey, modelId);
  } else if (mode === "local") {
    text = await promptWithLocalAgentFast(prompt, apiKey, modelId);
  } else {
    try {
      text = await promptWithLocalAgentFast(prompt, apiKey, modelId);
    } catch (localErr) {
      throw localAgentHelpError(localErr);
    }
  }

  return parseAiJson(text);
}
