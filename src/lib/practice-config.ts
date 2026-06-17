/** Giới hạn số câu mỗi phiên luyện Part 5. */
export const PRACTICE_SESSION = {
  min: 50,
  max: 70,
  default: 60,
  presets: [50, 60, 70] as const,
  aiChunkSize: 20,
};

export function clampPracticeCount(n: number): number {
  return Math.min(PRACTICE_SESSION.max, Math.max(PRACTICE_SESSION.min, Math.round(n)));
}
