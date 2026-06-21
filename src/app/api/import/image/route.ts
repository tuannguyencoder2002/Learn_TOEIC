import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { generateWithCursor, resolveApiKey } from "@/lib/cursor-client";
import { getDefaultUserId, withTransaction } from "@/lib/db";
import { normalizeParsedQuestion, toImportDisplay } from "@/lib/import-display";
import { buildImageExtractPrompt } from "@/lib/prompts-image";
import type { ParsedQuestionInput } from "@/lib/repositories/questions";
import { saveExerciseSet } from "@/lib/repositories/questions";
import type { QuestionCategory } from "@/lib/types";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function parseQuestions(raw: unknown): ParsedQuestionInput[] {
  const data = raw as Record<string, unknown>;
  const questions = data.questions;
  if (!Array.isArray(questions)) throw new Error("AI khĂ´ng tráº£ vá» questions");

  return questions.map((q: Record<string, unknown>, i: number) => {
    const options = q.options as string[];
    if (!Array.isArray(options) || options.length !== 4) {
      throw new Error(`CĂ¢u ${i + 1}: cáº§n 4 Ä‘Ă¡p Ă¡n`);
    }
    const correctIndex = Number(q.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      throw new Error(`CĂ¢u ${i + 1}: correctIndex khĂ´ng há»£p lá»‡`);
    }

    return normalizeParsedQuestion({
      sentence: String(q.sentence ?? ""),
      options: options as [string, string, string, string],
      correctIndex: correctIndex as 0 | 1 | 2 | 3,
      category: (q.category as QuestionCategory) ?? "word_form",
      topic: q.topic ? String(q.topic) : undefined,
      explanation: q.explanation ? String(q.explanation) : undefined,
      explanationVi: q.explanationVi ? String(q.explanationVi) : undefined,
      questionNumber: q.questionNumber ? Number(q.questionNumber) : undefined,
      sentenceComplete: q.sentenceComplete ? String(q.sentenceComplete) : undefined,
      sentenceVi: q.sentenceVi ? String(q.sentenceVi) : undefined,
      correctWord: q.correctWord ? String(q.correctWord) : undefined,
      wordType: q.wordType ? String(q.wordType) : undefined,
      meaningVi: q.meaningVi ? String(q.meaningVi) : undefined,
      grammarHintVi: q.grammarHintVi ? String(q.grammarHintVi) : undefined,
      vocabulary: Array.isArray(q.vocabulary)
        ? q.vocabulary.map((v: Record<string, string>) => ({
            word: String(v.word ?? ""),
            meaning: String(v.meaning ?? ""),
            type: String(v.type ?? ""),
            example: v.example ? String(v.example) : undefined,
          }))
        : [],
    });
  });
}

function collectImageFiles(formData: FormData): File[] {
  const fromList = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (fromList.length) return fromList;

  const single = formData.get("image");
  if (single instanceof File && single.size > 0) return [single];

  return [];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = collectImageFiles(formData);
    const apiKey = resolveApiKey(
      (formData.get("apiKey") as string) || request.headers.get("x-cursor-api-key")
    );
    const modelId =
      (formData.get("modelId") as string) ||
      process.env.CURSOR_MODEL ||
      "auto";
    const title = (formData.get("title") as string) || "BĂ i import tá»« áº£nh";

    if (!files.length) {
      return NextResponse.json({ error: "Thiáº¿u file áº£nh" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const savedFiles: { file: File; filePath: string; mimeType: string; buffer: Buffer }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || "image/png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      await writeFile(filePath, buffer);
      savedFiles.push({ file, filePath, mimeType, buffer });
    }

    const images = savedFiles.map(({ buffer, mimeType }) => ({
      mimeType,
      data: buffer.toString("base64"),
    }));

    const prompt = buildImageExtractPrompt(files.length);
    const mode =
      (process.env.CURSOR_AGENT_MODE as "local" | "cloud" | "auto") || "auto";

    const parsed = (await generateWithCursor(
      prompt,
      apiKey,
      modelId,
      mode,
      images,
    )) as Record<string, unknown>;

    const questions = parseQuestions(parsed);

    const saved = await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);

      const sourceIds: string[] = [];
      for (let i = 0; i < savedFiles.length; i++) {
        const { file, filePath, mimeType, buffer } = savedFiles[i];
        const pageTitle =
          savedFiles.length > 1
            ? `${title} (trang ${i + 1}/${savedFiles.length})`
            : title;

        const sourceRes = await client.query<{ id: string }>(
          `INSERT INTO source_materials
             (user_id, title, material_type, file_name, file_path, mime_type, file_size_bytes)
           VALUES ($1, $2, 'image', $3, $4, $5, $6)
           RETURNING id`,
          [userId, pageTitle, file.name, filePath, mimeType, buffer.length]
        );
        sourceIds.push(sourceRes.rows[0].id);
      }

      const extractRes = await client.query<{ id: string }>(
        `INSERT INTO ai_extractions
           (source_material_id, model_id, status, raw_response, review_summary_vi, completed_at)
         VALUES ($1, $2, 'completed', $3, $4, NOW())
         RETURNING id`,
        [
          sourceIds[0],
          modelId,
          JSON.stringify(parsed),
          String(parsed.reviewSummaryVi ?? ""),
        ]
      );
      const extractionId = extractRes.rows[0].id;

      return saveExerciseSet(client, userId, {
        title: String(parsed.title ?? title),
        sourceType: "image_import",
        category: String(parsed.category ?? "mixed"),
        sourceMaterialId: sourceIds[0],
        aiExtractionId: extractionId,
        questions,
      });
    });

    return NextResponse.json({
      success: true,
      setId: saved.setId,
      questionCount: questions.length,
      imageCount: files.length,
      title: String(parsed.title ?? title),
      reviewSummaryVi: parsed.reviewSummaryVi ?? null,
      questions: questions.map((q, i) => toImportDisplay(q, i)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
