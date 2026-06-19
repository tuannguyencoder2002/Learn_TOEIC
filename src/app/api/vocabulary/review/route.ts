import { NextRequest, NextResponse } from "next/server";
import { getDefaultUserId, withTransaction } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { reviewSavedWord } from "@/lib/repositories/saved-words";

// Ôn một từ: { vocabularyId, remembered: boolean }
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const vocabularyId = String(body.vocabularyId ?? "");
    if (!vocabularyId) {
      return NextResponse.json({ error: "Thiếu vocabularyId" }, { status: 400 });
    }
    const remembered = Boolean(body.remembered);

    await withTransaction(async (client) => {
      const userId = await getDefaultUserId(client);
      await reviewSavedWord(client, userId, vocabularyId, remembered);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
