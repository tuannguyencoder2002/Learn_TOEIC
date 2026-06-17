import type { GenerateQuizRequest } from "./types";

export function buildGeneratePrompt(
  params: GenerateQuizRequest,
  batch?: { batch: number; totalBatches: number }
): string {
  const count = params.count ?? 10;  const category = params.category ?? "mixed";
  const topic = params.topic?.trim() || "business English, office, finance, technology";
  const difficulty = params.difficulty ?? "medium";

  const batchNote =
    batch && batch.totalBatches > 1
      ? `\nThis is batch ${batch.batch} of ${batch.totalBatches}. Use unique sentences and varied topics — no repetition from typical TOEIC drills.`
      : "";

  return `You are an expert TOEIC Part 5 instructor. Generate ${count} high-quality TOEIC Part 5 incomplete sentence questions.${batchNote}

Focus category: ${category}
Topic context: ${topic}
Difficulty: ${difficulty}

Rules (TOEIC Part 5 standard):
- Each sentence has ONE blank shown as "_______" in the sentence field.
- Exactly 4 options (A-D), only ONE correct answer.
- Test word forms (noun/verb/adjective/adverb), grammar, vocabulary, or collocations as appropriate.
- Use professional/business English contexts (meetings, HR, finance, logistics, marketing).
- Explanations must be accurate and reference standard English grammar rules.
- Include Vietnamese translation in explanationVi for learners.
- Include 1-2 vocabulary items per question with Vietnamese meaning.

Return ONLY valid JSON (no markdown, no code fences) in this exact shape:
{
  "title": "string - short quiz title in Vietnamese",
  "questions": [
    {
      "id": "q1",
      "sentence": "The manager asked us to submit the report _______ Friday.",
      "options": ["by", "for", "at", "on"],
      "correctIndex": 0,
      "category": "grammar",
      "topic": "preposition of time",
      "explanation": "English explanation with grammar rule",
      "explanationVi": "Giải thích tiếng Việt",
      "vocabulary": [
        {
          "word": "submit",
          "meaning": "nộp, gửi",
          "type": "verb",
          "example": "Please submit your application by Monday."
        }
      ]
    }
  ]
}

correctIndex must be 0, 1, 2, or 3 (matching options array index).
category must be one of: word_form, grammar, vocabulary, collocation.`;
}
