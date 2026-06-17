"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ALL_TOEIC_650,
  TOEIC_650_UNITS,
  type ToeicVocabItem,
  type ToeicVocabUnit,
  pickDistractors,
  shuffle,
} from "@/lib/toeic-vocab-650";

type ExerciseType = "flashcard" | "pick_meaning" | "pick_word";

interface WordProgress {
  mastered: boolean;
  xp: number;
}

interface VocabProgress {
  xp: number;
  streak: number;
  lastStudyDate: string;
  words: Record<string, WordProgress>;
  completedUnits: string[];
}

const PROGRESS_KEY = "learn-toeic-vocab-duolingo";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadProgress(): VocabProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { xp: 0, streak: 0, lastStudyDate: "", words: {}, completedUnits: [] };
}

function saveProgress(p: VocabProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function buildExercises(unit: ToeicVocabUnit): { type: ExerciseType; word: ToeicVocabItem }[] {
  const list: { type: ExerciseType; word: ToeicVocabItem }[] = [];
  for (const word of unit.words) {
    list.push({ type: "flashcard", word });
    list.push({ type: "pick_meaning", word });
    list.push({ type: "pick_word", word });
  }
  return shuffle(list);
}

export function VocabDuolingo() {
  const [progress, setProgress] = useState<VocabProgress>(loadProgress);
  const [selectedUnit, setSelectedUnit] = useState<ToeicVocabUnit | null>(null);
  const [exercises, setExercises] = useState<ReturnType<typeof buildExercises>>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const current = exercises[index];
  const pool = ALL_TOEIC_650;

  const unitProgress = useMemo(() => {
    if (!selectedUnit) return 0;
    const done = selectedUnit.words.filter((w) => progress.words[w.id]?.mastered).length;
    return Math.round((done / selectedUnit.words.length) * 100);
  }, [selectedUnit, progress]);

  const startUnit = (unit: ToeicVocabUnit) => {
    setSelectedUnit(unit);
    setExercises(buildExercises(unit));
    setIndex(0);
    setSelected(null);
    setShowResult(false);
    setFlipped(false);
    setSessionCorrect(0);
  };

  const finishSession = useCallback(() => {
    if (!selectedUnit) return;
    setProgress((prev) => {
      const next = { ...prev };
      if (!next.completedUnits.includes(selectedUnit.id)) {
        next.completedUnits = [...next.completedUnits, selectedUnit.id];
      }
      saveProgress(next);
      return next;
    });
    setSelectedUnit(null);
  }, [selectedUnit]);

  const handleCorrect = useCallback(() => {
    if (!current) return;
    setProgress((prev) => {
      const today = todayStr();
      let streak = prev.streak;
      if (prev.lastStudyDate !== today) {
        streak = prev.lastStudyDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          ? prev.streak + 1
          : 1;
      }
      const wordProg = prev.words[current.word.id] ?? { mastered: false, xp: 0 };
      const words = {
        ...prev.words,
        [current.word.id]: {
          mastered: wordProg.xp + 10 >= 30,
          xp: Math.min(30, wordProg.xp + 10),
        },
      };
      const next = {
        ...prev,
        xp: prev.xp + 10,
        streak,
        lastStudyDate: today,
        words,
      };
      saveProgress(next);
      return next;
    });
    setSessionCorrect((c) => c + 1);
  }, [current]);

  const goNext = () => {
    if (index >= exercises.length - 1) {
      finishSession();
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowResult(false);
    setFlipped(false);
  };

  const checkAnswer = (answer: string, correct: string) => {
    setSelected(answer);
    setShowResult(true);
    if (answer === correct) handleCorrect();
  };

  const options = useMemo(() => {
    if (!current || current.type === "flashcard") return [];
    if (current.type === "pick_meaning") {
      const distractors = pickDistractors(current.word, pool, 3, "meaning");
      return shuffle([current.word.meaning, ...distractors]);
    }
    const distractors = pickDistractors(current.word, pool, 3, "word");
    return shuffle([current.word.word, ...distractors]);
  }, [current, pool]);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!selectedUnit) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-4">
          <div className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2.5 sm:rounded-2xl sm:px-5 sm:py-3">
            <p className="text-[10px] text-accent sm:text-xs">XP</p>
            <p className="text-lg font-bold text-brand sm:text-2xl">{progress.xp}</p>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 sm:rounded-2xl sm:px-5 sm:py-3">
            <p className="text-[10px] text-amber-700 sm:text-xs">Streak</p>
            <p className="text-lg font-bold text-brand sm:text-2xl">{progress.streak} ngày</p>
          </div>
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 sm:rounded-2xl sm:px-5 sm:py-3">
            <p className="text-[10px] text-emerald-700 sm:text-xs">Band mục tiêu</p>
            <p className="text-lg font-bold text-brand sm:text-2xl">650</p>
          </div>
        </div>

        <p className="text-sm text-brand-muted">
          48 từ TOEIC band 650 · 4 chủ đề (Office, HR, Finance, Business) · phong cách Duolingo
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {TOEIC_650_UNITS.map((unit) => {
            const done = unit.words.filter((w) => progress.words[w.id]?.mastered).length;
            const pct = Math.round((done / unit.words.length) * 100);
            const locked = false;
            return (
              <button
                key={unit.id}
                type="button"
                disabled={locked}
                onClick={() => startUnit(unit)}
                className="touch-target w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition hover:border-accent/40 hover:shadow-md disabled:opacity-40 sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{pct >= 100 ? "⭐" : "📘"}</span>
                  <span className="text-xs text-brand-muted">{done}/{unit.words.length}</span>
                </div>
                <h3 className="mt-3 font-semibold text-brand">{unit.titleVi}</h3>
                <p className="text-sm text-brand-muted">{unit.title}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!current) return null;

  const progressPct = Math.round(((index + 1) / exercises.length) * 100);

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center justify-between text-sm text-brand-muted">
        <button type="button" onClick={finishSession} className="text-accent hover:underline">
          ← Thoát
        </button>
        <span>
          {index + 1}/{exercises.length} · Đúng {sessionCorrect}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-surface">
        <div className="h-full bg-emerald-600 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      {current.type === "flashcard" && (
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="touch-target w-full rounded-3xl border-2 border-border bg-white p-6 text-center shadow-md transition hover:border-accent/40 sm:p-10"
        >
          {!flipped ? (
            <>
              <p className="text-xs uppercase tracking-wider text-accent">Nhấn để lật</p>
              <p className="mt-4 text-2xl font-bold text-brand sm:text-3xl">{current.word.word}</p>
              <p className="mt-2 text-sm text-brand-muted">{current.word.type}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold text-emerald-700">{current.word.meaning}</p>
              <p className="mt-4 text-sm italic text-brand-muted">{current.word.example}</p>
            </>
          )}
        </button>
      )}

      {current.type === "pick_meaning" && (
        <div className="space-y-4">
          <p className="text-center text-sm text-brand-muted">Chọn nghĩa đúng</p>
          <p className="break-words text-center text-2xl font-bold text-brand sm:text-3xl">{current.word.word}</p>
          <div className="grid gap-2">
            {options.map((opt) => {
              let cls = "border-border bg-white text-brand hover:border-accent/40 hover:bg-surface";
              if (showResult && opt === current.word.meaning) cls = "border-emerald-600 bg-emerald-50 text-emerald-800";
              else if (showResult && opt === selected) cls = "border-rose-500 bg-rose-50 text-rose-800";
              else if (selected === opt) cls = "border-accent bg-accent/5 text-brand";
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={showResult}
                  onClick={() => checkAnswer(opt, current.word.meaning)}
                  className={`touch-target rounded-2xl border px-4 py-3.5 text-left text-sm transition sm:py-4 ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {current.type === "pick_word" && (
        <div className="space-y-4">
          <p className="text-center text-sm text-brand-muted">Chọn từ tiếng Anh đúng</p>
          <p className="text-center text-2xl font-semibold text-emerald-700">{current.word.meaning}</p>
          <div className="grid gap-2">
            {options.map((opt) => {
              let cls = "border-border bg-white text-brand hover:border-accent/40 hover:bg-surface";
              if (showResult && opt === current.word.word) cls = "border-emerald-600 bg-emerald-50 text-emerald-800";
              else if (showResult && opt === selected) cls = "border-rose-500 bg-rose-50 text-rose-800";
              else if (selected === opt) cls = "border-accent bg-accent/5 text-brand";
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={showResult}
                  onClick={() => checkAnswer(opt, current.word.word)}
                  className={`touch-target rounded-2xl border px-4 py-3.5 text-left font-medium transition sm:py-4 ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        {(current.type === "flashcard" && flipped) || showResult ? (
          <button
            type="button"
            onClick={goNext}
            className="touch-target w-full rounded-2xl bg-brand px-8 py-3 font-semibold text-white sm:w-auto"
          >
            {index >= exercises.length - 1 ? "Hoàn thành 🎉" : "Tiếp tục"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
