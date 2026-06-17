/** Trích JSON từ phản hồi AI (markdown fence hoặc text lẫn JSON). */
export function parseAiJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch?.[1]) {
      return JSON.parse(fenceMatch[1].trim());
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI không trả về JSON hợp lệ");
  }
}
