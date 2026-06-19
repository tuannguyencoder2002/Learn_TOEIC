"use client";

import type { ToeicQuestion } from "@/lib/types";
import { WordSaver } from "@/components/WordSaver";

const LABELS = ["A", "B", "C", "D"];

interface QuestionCardProps {
  question: ToeicQuestion;
  index: number;
  selectedIndex: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
  onWordSaved?: () => void;
}

export function QuestionCard({
  question,
  index,
  selectedIndex,
  showResult,
  onSelect,
  onWordSaved,
}: QuestionCardProps) {
  const part = question.partNumber ?? 5;

  return (
    <article className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <WordSaver onSaved={onWordSaved}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <span className="flex w-fit items-center gap-2">
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            Part {part}
          </span>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Câu {index + 1}
          </span>
        </span>
        <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs text-brand-muted">
          {question.topic}
        </span>
      </div>

      {question.passageText && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          {question.passageTitle && (
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-brand">{question.passageTitle}</p>
              {question.passageType && (
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-muted">
                  {question.passageType}
                </span>
              )}
            </div>
          )}
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-brand">
            {question.passageText}
          </p>
          {question.passageVi && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-accent">
                Xem bản dịch tiếng Việt
              </summary>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-brand-muted">
                {question.passageVi}
              </p>
            </details>
          )}
        </div>
      )}

      <p className="break-words text-[15px] font-medium leading-relaxed text-brand sm:text-base">
        {question.questionText ?? question.sentence}
      </p>

      <div className="mt-4 grid gap-2 sm:mt-5">
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
              className={`touch-target flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition sm:px-4 ${style}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-semibold text-brand sm:h-7 sm:w-7">
                {LABELS[optionIndex]}
              </span>
              <span className="min-w-0 break-words">{option}</span>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-5 space-y-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-brand">
            <span className="font-medium text-emerald-700">Đáp án đúng: </span>
            {LABELS[question.correctIndex]}. {question.options[question.correctIndex]}
          </p>
          {question.explanationVi && (
            <p className="text-sm leading-relaxed text-brand-muted">
              {question.explanationVi}
            </p>
          )}
          <p className="text-xs leading-relaxed text-brand-muted/80">{question.explanation}</p>
        </div>
      )}
      </WordSaver>
    </article>
  );
}
