export type QuestionCategory =
  | "word_form"
  | "grammar"
  | "vocabulary"
  | "collocation"
  | "text_completion"
  | "sentence_insertion"
  | "connector"
  | "reading";

/** Các loại câu hỏi cho bộ tạo đề Part 5 bằng AI (chỉ 4 dạng cốt lõi). */
export const PART5_CATEGORIES: QuestionCategory[] = [
  "word_form",
  "grammar",
  "vocabulary",
  "collocation",
];

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
  /** Part 5 = 5, Part 6 = 6, Part 7 = 7. Mặc định 5. */
  partNumber?: number;
  /** Part 7: câu hỏi đọc hiểu (vd "What is the purpose...?"). */
  questionText?: string;
  /** Part 6/7: đoạn văn đi kèm (email, thông báo, bài đọc...). */
  passageText?: string;
  passageVi?: string;
  passageTitle?: string;
  passageType?: string;
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
  text_completion: "Điền đoạn văn",
  sentence_insertion: "Chèn câu",
  connector: "Từ nối / Liên từ",
  reading: "Đọc hiểu",
  mixed: "Hỗn hợp",
};

export const STORAGE_KEYS = {
  settings: "learn-toeic-settings",
  customQuizzes: "learn-toeic-custom-quizzes",
} as const;
