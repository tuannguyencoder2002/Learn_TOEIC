"use client";

import { useEffect, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { getApiHeaders, useAppSettings } from "@/hooks/useAppSettings";
import { PRACTICE_SESSION } from "@/lib/practice-config";
import type { ToeicQuestion } from "@/lib/types";

type ReviewMode = "due" | "weak";

interface Stats {
  total: string;
  due: string;
  weak: string;
  mastered: string;
}

export default function ReviewPage() {
  const { settings, loaded } = useAppSettings();
  const [stats, setStats] = useState<Stats | null>(null);
  const [mode, setMode] = useState<ReviewMode>("due");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ToeicQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [score, setScore] = useState(0);

  const loadStats = () => {
    fetch("/api/practice?action=stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .catch(() => setStats(null));
  };

  useEffect(() => {
    if (loaded) loadStats();
  }, [loaded]);

  const startReview = async (selectedMode: ReviewMode) => {
    setLoading(true);
    setError(null);
    setMode(selectedMode);
    setShowSummary(false);
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: selectedMode, limit: PRACTICE_SESSION.default }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!data.questions?.length) {
        setError(data.message ?? "Không có câu cần ôn. Hãy import thêm bài!");
        setQuestions([]);
        return;
      }

      setSessionId(data.sessionId);
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const selectedIndex = currentQuestion ? answers[currentQuestion.id] ?? null : null;

  const handleCheck = async () => {
    if (!currentQuestion || !sessionId || selectedIndex === null) return;

    const isLast = currentIndex >= questions.length - 1;

    try {
      const res = await fetch("/api/practice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedIndex,
          finish: isLast,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.isCorrect) setScore((s) => s + 1);
      setShowResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu đáp án");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setShowResult(false);
      return;
    }
    setShowSummary(true);
    loadStats();
  };

  if (!loaded) return <p className="text-brand-muted">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-accent">Spaced Repetition</p>
        <h1 className="text-xl font-bold text-brand sm:text-2xl">Ôn lại đến thuần thục</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Hệ thống tự đưa lại câu sai và câu đến hạn ôn tập từ database.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          {[
            { label: "Tổng câu", value: stats.total },
            { label: "Đến hạn ôn", value: stats.due, highlight: true },
            { label: "Câu hay sai", value: stats.weak },
            { label: "Thuần thục", value: stats.mastered },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-3 sm:p-4 ${
                item.highlight
                  ? "border-accent/30 bg-accent/5"
                  : "border-border bg-white shadow-sm"
              }`}
            >
              <p className="text-xs text-brand-muted">{item.label}</p>
              <p className="text-xl font-bold text-brand sm:text-2xl">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {!sessionId && !showSummary && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={() => startReview("due")}
            disabled={loading}
            className="touch-target w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
          >
            {loading && mode === "due" ? "Đang tải..." : "Ôn câu đến hạn"}
          </button>
          <button
            type="button"
            onClick={() => startReview("weak")}
            disabled={loading}
            className="touch-target w-full rounded-xl border border-rose-300 bg-rose-50 px-5 py-3 text-sm text-rose-800 disabled:opacity-50 sm:w-auto"
          >
            {loading && mode === "weak" ? "Đang tải..." : "Luyện câu hay sai"}
          </button>
          <a
            href="/import"
            className="touch-target flex w-full items-center justify-center rounded-xl border border-border px-5 py-3 text-sm text-brand sm:w-auto"
          >
            Import ảnh bài mới
          </a>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
          {error.includes("DATABASE") && (
            <span>
              {" "}
              Chạy <code className="text-rose-900">setup-db.bat</code> trước.
            </span>
          )}
        </p>
      )}

      {currentQuestion && !showSummary && sessionId && (
        <>
          <p className="text-sm text-brand-muted">
            Câu {currentIndex + 1}/{questions.length}
          </p>
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            selectedIndex={selectedIndex}
            showResult={showResult}
            onSelect={(idx) => !showResult && setAnswers((p) => ({ ...p, [currentQuestion.id]: idx }))}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {!showResult ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={selectedIndex === null}
                className="touch-target w-full rounded-xl border border-brand bg-white px-5 py-3 text-sm font-semibold text-brand disabled:opacity-40 sm:w-auto"
              >
                Kiểm tra & lưu tiến độ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="touch-target w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                {currentIndex < questions.length - 1 ? "Câu tiếp" : "Xem kết quả"}
              </button>
            )}
          </div>
        </>
      )}

      {showSummary && (
        <section className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm sm:p-8">
          <p className="text-sm text-accent">Hoàn thành phiên ôn tập</p>
          <h2 className="mt-2 text-3xl font-bold text-brand sm:text-4xl">
            {score}/{questions.length}
          </h2>
          <p className="mt-2 text-sm text-brand-muted sm:text-base">
            Câu sai sẽ được đưa lại sau vài giờ. Câu đúng liên tiếp sẽ dần thuần thục.
          </p>
          <button
            type="button"
            onClick={() => {
              setSessionId(null);
              setShowSummary(false);
              setScore(0);
              loadStats();
            }}
            className="touch-target mt-6 w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            Quay lại
          </button>
        </section>
      )}
    </div>
  );
}
