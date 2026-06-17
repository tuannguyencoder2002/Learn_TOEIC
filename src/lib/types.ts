export type QuestionCategory =
  | "word_form"
  | "grammar"
  | "vocabulary"
  | "collocation";

export interface VocabularyItem {
  word: string;
  meaning: string;
  type: string;
  example?: string;
}

export interface ToeicQuestion {
  id: string;
  sentence: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category: QuestionCategory;
  topic: string;
  explanation: string;
  explanationVi?: string;
  vocabulary: VocabularyItem[];
}

export interface QuizSet {
  id: string;
  title: string;
  source: "seed" | "ai" | "db" | "mixed";
  questions: ToeicQuestion[];
  createdAt: string;
}

export interface GenerateQuizRequest {
  count?: number;
  category?: QuestionCategory | "mixed";
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  modelId?: string;
  apiKey?: string;
}

export interface CursorModel {
  id: string;
  displayName: string;
  description?: string;
}

export interface AppSettings {
  apiKey: string;
  modelId: string;
}

export const CATEGORY_LABELS: Record<QuestionCategory | "mixed", string> = {
  word_form: "Dạng từ (Word Forms)",
  grammar: "Ngữ pháp",
  vocabulary: "Từ vựng",
  collocation: "Cụm từ / Collocation",
  mixed: "Hỗn hợp",
};

export const STORAGE_KEYS = {
  settings: "learn-toeic-settings",
  customQuizzes: "learn-toeic-custom-quizzes",
} as const;
