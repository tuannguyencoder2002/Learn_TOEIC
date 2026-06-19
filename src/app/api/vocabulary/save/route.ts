import { NextRequest, NextResponse } from "next/server";
import { getDefaultUserId, withTransaction } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import {
  countDueSavedWords,
  listSavedWords,
  saveWord,
  unsaveWord,
  updateSavedWordMeaning,
} from "@/lib/repositories/saved-words";

// Lưu một từ người dùng bôi đen
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const word = String(body.word ?? "").trim();
    if (!word || word.length > 60) {
      return NextResponse.json({ error: "Từ không hợp lệ" }, { status: 400 });
    }

    const result = await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);
      const { vocabularyId } = await saveWord(client, userId, {
        word,
        meaning: body.meaning ? String(body.meaning) : null,
        partOfSpeech: body.type ? String(body.type) : null,
        example: body.example ? String(body.example) : null,
        context: body.context ? String(body.context).slice(0, 500) : null,
      });

      const meaningRes = await client.query<{ meaning_vi: string | null }>(
        `SELECT meaning_vi FROM vocabulary WHERE id = $1`,
        [vocabularyId]
      );
      return {
        vocabularyId,
        word,
        meaning: meaningRes.rows[0]?.meaning_vi ?? "",
      };
    });

    return NextResponse.json({ saved: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Danh sách từ đã lưu (?due=1 để chỉ lấy từ đến hạn ôn)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dueOnly = searchParams.get("due") === "1";

    const data = await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);
      const words = await listSavedWords(client, userId, dueOnly);
      const counts = await countDueSavedWords(client, userId);
      return { words, counts };
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message, words: [], counts: { total: 0, due: 0 } }, { status: 500 });
  }
}

// Cập nhật nghĩa / ghi chú
export async function PATCH(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const vocabularyId = String(body.vocabularyId ?? "");
    if (!vocabularyId) {
      return NextResponse.json({ error: "Thiếu vocabularyId" }, { status: 400 });
    }

    await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);
      await updateSavedWordMeaning(
        client,
        userId,
        vocabularyId,
        body.meaning !== undefined ? String(body.meaning) : undefined,
        body.note !== undefined ? String(body.note) : undefined
      );
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Bỏ lưu một từ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vocabularyId = searchParams.get("id");
    if (!vocabularyId) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);
      await unsaveWord(client, userId, vocabularyId);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
