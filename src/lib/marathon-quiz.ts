import { SEED_QUIZ } from "@/lib/seed-questions";
import type { QuizSet, ToeicQuestion } from "@/lib/types";
import { clampPracticeCount } from "@/lib/practice-config";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Ghép câu DB + bài mẫu đến đủ target (50–70). */
export function buildMarathonQuiz(
  dbQuestions: ToeicQuestion[],
  targetCount: number
): QuizSet {
  const limit = clampPracticeCount(targetCount);
  const used = new Set(dbQuestions.map((q) => q.sentence));
  const seedPool = SEED_QUIZ.questions.filter((q) => !used.has(q.sentence));
  const merged = shuffle([...dbQuestions, ...seedPool]).slice(0, limit);

  let source: QuizSet["source"] = "db";
  if (merged.length === 0) {
    source = "seed";
  } else if (dbQuestions.length === 0) {
    source = "seed";
  } else if (merged.length > dbQuestions.length) {
    source = "mixed";
  }

  return {
    id: `marathon-${Date.now()}`,
    title: `Luyện marathon — ${merged.length} câu`,
    source,
    createdAt: new Date().toISOString(),
    questions: merged,
  };
}
