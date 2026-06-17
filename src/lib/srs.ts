export interface SrsUpdateInput {
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  consecutiveCorrect: number;
  masteryLevel: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: Date | null;
}

export function computeSrsUpdate(
  prev: {
    timesSeen: number;
    timesCorrect: number;
    timesWrong: number;
    consecutiveCorrect: number;
    masteryLevel: number;
    easeFactor: number;
    intervalDays: number;
  },
  isCorrect: boolean
): SrsUpdateInput {
  const now = new Date();
  let {
    timesSeen,
    timesCorrect,
    timesWrong,
    consecutiveCorrect,
    masteryLevel,
    easeFactor,
    intervalDays,
  } = prev;

  timesSeen += 1;

  if (isCorrect) {
    timesCorrect += 1;
    consecutiveCorrect += 1;
    easeFactor = Math.min(3.0, easeFactor + 0.1);

    if (consecutiveCorrect >= 3) {
      masteryLevel = 3;
      intervalDays = 30;
    } else if (timesSeen === 1) {
      masteryLevel = 1;
      intervalDays = 1;
    } else {
      masteryLevel = Math.max(masteryLevel, 2);
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }

    const nextReviewAt = new Date(now);
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    return {
      timesSeen,
      timesCorrect,
      timesWrong,
      consecutiveCorrect,
      masteryLevel,
      easeFactor,
      intervalDays,
      nextReviewAt: masteryLevel >= 3 ? null : nextReviewAt,
    };
  }

  timesWrong += 1;
  consecutiveCorrect = 0;
  masteryLevel = Math.min(masteryLevel, 1);
  easeFactor = Math.max(1.3, easeFactor - 0.2);
  intervalDays = 0;

  const nextReviewAt = new Date(now);
  nextReviewAt.setHours(nextReviewAt.getHours() + 4);

  return {
    timesSeen,
    timesCorrect,
    timesWrong,
    consecutiveCorrect,
    masteryLevel,
    easeFactor,
    intervalDays,
    nextReviewAt,
  };
}
