"use client";

import type { Part1Question } from "@/lib/listening-part1-seed";

const LABELS = ["A", "B", "C", "D"];

interface ListeningPart1CardProps {
  question: Part1Question;
  index: number;
  selectedIndex: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
}

export function ListeningPart1Card({
  question,
  index,
  selectedIndex,
  showResult,
  onSelect,
}: ListeningPart1CardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-surface sm:aspect-[16/10]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={question.imageUrl}
          alt={question.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand/85 px-3 py-1 text-xs font-semibold text-white">
          Câu {index + 1}
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <p className="text-sm text-brand-muted">
          Chọn câu mô tả <strong className="text-brand">đúng nhất</strong> cho bức ảnh (chế độ
          đọc — thi thật sẽ nghe audio).
        </p>

        <div className="grid gap-2">
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedIndex === optionIndex;
            const isCorrect = optionIndex === question.correctIndex;
            let style =
              "border-border bg-white text-brand hover:border-accent/40 hover:bg-surface";

            if (showResult && isCorrect) {
              style = "border-emerald-600 bg-emerald-50 text-emerald-800";
            } else if (showResult && isSelected && !isCorrect) {
              style = "border-rose-500 bg-rose-50 text-rose-800";
            } else if (isSelected) {
              style = "border-accent bg-accent/5 text-brand";
            }

            return (
              <button
                key={optionIndex}
                type="button"
                disabled={showResult}
                onClick={() => onSelect(optionIndex)}
                className={`touch-target flex items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm transition sm:px-4 ${style}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-semibold">
                  {LABELS[optionIndex]}
                </span>
                <span className="min-w-0 break-words">{option}</span>
              </button>
            );
          })}
        </div>

        {showResult && (
          <p className="rounded-xl border border-border bg-surface p-3 text-sm leading-relaxed text-brand-muted">
            {question.explanationVi}
          </p>
        )}

        <p className="text-[10px] text-brand-muted/70">
          Ảnh: {question.photographer} / Unsplash (free license)
        </p>
      </div>
    </article>
  );
}
