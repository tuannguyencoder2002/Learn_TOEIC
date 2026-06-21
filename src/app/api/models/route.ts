import { NextRequest, NextResponse } from "next/server";
import { listOpenAiModels, resolveApiKey } from "@/lib/openai-client";

export async function GET(request: NextRequest) {
  try {
    const apiKey = resolveApiKey(
      request.headers.get("x-openai-api-key") ||
        request.headers.get("x-cursor-api-key")
    );
    const models = await listOpenAiModels(apiKey);
    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message, models: [] }, { status: 400 });
  }
}
