"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { getApiHeaders, useAppSettings } from "@/hooks/useAppSettings";
import { buildMarathonQuiz } from "@/lib/marathon-quiz";
import { PRACTICE_SESSION, clampPracticeCount } from "@/lib/practice-config";
import { SEED_QUIZ } from "@/lib/seed-questions";
import {
  CATEGORY_LABELS,
  PART5_CATEGORIES,
  STORAGE_KEYS,
  type CursorModel,
  type GenerateQuizRequest,
  type QuizSet,
  type ToeicQuestion,
} from "@/lib/types";

const PART_INFO = [
  { part: 5, label: "Part 5", desc: "Hoàn thành câu (Incomplete Sentences)" },
  { part: 6, label: "Part 6", desc: "Điền đoạn văn (Text Completion)" },
  { part: 7, label: "Part 7", desc: "Đọc hiểu (Reading Comprehension)" },
] as const;

function sourceLabel(source: QuizSet["source"]) {
  switch (source) {
    case "seed":
      return "Sách mẫu";
    case "ai":
      return "AI OpenAI";
    case "db":
      return "Database";
    case "mixed":
      return "DB + bài mẫu";
    default:
      return source;
  }
}
function PracticeContent() {
  const searchParams = useSearchParams();
  const { settings, loaded } = useAppSettings();

  const [quiz, setQuiz] = useState<QuizSet>(SEED_QUIZ);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [models, setModels] = useState<CursorModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingMarathon, setLoadingMarathon] = useState(false);
  const [marathonCount, setMarathonCount] = useState(PRACTICE_SESSION.default);
  const [error, setError] = useState<string | null>(null);
  const [partCounts, setPartCounts] = useState<Record<number, number>>({});
  const [loadingPart, setLoadingPart] = useState<number | null>(null);

  const [genForm, setGenForm] = useState<GenerateQuizRequest>({
    count: PRACTICE_SESSION.default,    category: "word_form",
    topic: "office automation, business, finance",
    difficulty: "medium",
    modelId: settings.modelId,
  });

  const mode = searchParams.get("mode");
  const showGenerator = mode === "generate";

  useEffect(() => {
    if (!loaded) return;
    setGenForm((prev) => ({ ...prev, modelId: settings.modelId }));
  }, [loaded, settings.modelId]);

  useEffect(() => {
    if (!loaded) return;

    const customRaw = localStorage.getItem(STORAGE_KEYS.customQuizzes);
    if (customRaw) {
      try {
        const custom = JSON.parse(customRaw) as QuizSet[];
        const last = custom[custom.length - 1];
        if (last && searchParams.get("quiz") === "custom") {
          setQuiz(last);
        }
      } catch {
        // ignore
      }
    }
  }, [loaded, searchParams]);

  useEffect(() => {
    fetch("/api/practice?action=counts")
      .then((res) => res.json())
      .then((data) => {
        if (data.counts) setPartCounts(data.counts);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loaded || !settings.apiKey) return;

    setLoadingModels(true);
    fetch("/api/models", { headers: getApiHeaders(settings.apiKey) })
      .then((res) => res.json())
      .then((data) => {
        if (data.models?.length) setModels(data.models);
      })
      .finally(() => setLoadingModels(false));
  }, [loaded, settings.apiKey]);

  const currentQuestion = quiz.questions[currentIndex];
  const selectedIndex = currentQuestion
    ? answers[currentQuestion.id] ?? null
    : null;

  const score = useMemo(() => {
    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    return correct;
  }, [answers, quiz.questions]);

  const handleSelect = (optionIndex: number) => {
    if (!currentQuestion || showResult) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleCheck = () => {
    if (selectedIndex === null) return;
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setShowResult(false);
      return;
    }
    setShowSummary(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setShowSummary(false);
  };

  const handleGenerate = async () => {
    if (!settings.apiKey) {
      setError("Vui lòng nhập OpenAI API key trong Cài đặt trước.");
      return;
    }

    const count = clampPracticeCount(genForm.count ?? PRACTICE_SESSION.default);
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiHeaders(settings.apiKey),
        },
        body: JSON.stringify({
          ...genForm,
          count,
          modelId: settings.modelId,
          apiKey: settings.apiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo đề thất bại");

      const newQuiz = data.quiz as QuizSet;
      setQuiz(newQuiz);
      setCurrentIndex(0);
      setAnswers({});
      setShowResult(false);
      setShowSummary(false);

      const existingRaw = localStorage.getItem(STORAGE_KEYS.customQuizzes);
      const existing = existingRaw ? (JSON.parse(existingRaw) as QuizSet[]) : [];
      localStorage.setItem(
        STORAGE_KEYS.customQuizzes,
        JSON.stringify([...existing.slice(-4), newQuiz])
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setGenerating(false);
    }
  };

  const loadSeed = () => {
    setQuiz(SEED_QUIZ);
    handleRestart();
  };

  const handleMarathon = async () => {
    const target = clampPracticeCount(marathonCount);
    setLoadingMarathon(true);
    setError(null);

    try {
      const res = await fetch(`/api/practice?action=marathon&limit=${target}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const dbQuestions = (data.questions ?? []) as ToeicQuestion[];
      const newQuiz = buildMarathonQuiz(dbQuestions, target);

      if (newQuiz.questions.length < PRACTICE_SESSION.min) {
        setError(
          `Hiện chỉ có ${newQuiz.questions.length} câu trong kho. Import thêm ảnh hoặc dùng AI tạo ${target} câu.`,
        );
      } else if (newQuiz.questions.length < target) {
        setError(
          `Đủ ${newQuiz.questions.length} câu (DB: ${data.availableInDb ?? 0} + bài mẫu). Import thêm để đủ ${target} câu.`,
        );
      }

      setQuiz(newQuiz);
      setCurrentIndex(0);
      setAnswers({});
      setShowResult(false);
      setShowSummary(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được đề marathon");
    } finally {
      setLoadingMarathon(false);
    }
  };

  const handleBank = async (part: number) => {
    setLoadingPart(part);
    setError(null);

    try {
      const res = await fetch(`/api/practice?action=bank&part=${part}&limit=60`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const dbQuestions = (data.questions ?? []) as ToeicQuestion[];
      if (dbQuestions.length === 0) {
        setError(
          `Chưa có câu nào cho Part ${part} trong kho. Chạy lại scripts/seed-content.js để nạp đề.`,
        );
        return;
      }

      const partLabel = PART_INFO.find((p) => p.part === part)?.desc ?? `Part ${part}`;
      setQuiz({
        id: `bank-part${part}-${dbQuestions.length}`,
        title: `Part ${part} — ${partLabel}`,
        source: "db",
        createdAt: new Date().toISOString(),
        questions: dbQuestions,
      });
      setCurrentIndex(0);
      setAnswers({});
      setShowResult(false);
      setShowSummary(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được đề");
    } finally {
      setLoadingPart(null);
    }
  };

  const countPresets = (
    value: number,
    onChange: (n: number) => void,
    idPrefix: string
  ) => (
    <div className="flex flex-wrap gap-2">
      {PRACTICE_SESSION.presets.map((n) => (
        <button
          key={`${idPrefix}-${n}`}
          type="button"
          onClick={() => onChange(n)}
          className={`touch-target rounded-xl px-4 py-2 text-sm font-medium transition ${
            value === n
              ? "bg-brand text-white"
              : "border border-border bg-white text-brand hover:border-brand"
          }`}
        >
          {n} câu
        </button>
      ))}
    </div>
  );
  if (!loaded) {
    return <p className="text-brand-muted">Đang tải...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm text-accent">Luyện tập</p>
          <h1 className="text-xl font-bold text-brand sm:text-2xl">{quiz.title}</h1>
          <p className="mt-1 text-sm text-brand-muted">
            {quiz.questions.length} câu · Nguồn: {sourceLabel(quiz.source)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadSeed}
            className="touch-target w-full rounded-xl border border-border px-4 py-2.5 text-sm text-brand hover:border-brand sm:w-auto"
          >
            Bài mẫu (13 câu)
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold text-brand">Luyện theo Part (kho đề)</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Đề Part 5 / 6 / 7 đã được nạp sẵn vào database. Chọn part để luyện ngay — Part 6/7 kèm
          đoạn văn và bản dịch tiếng Việt.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PART_INFO.map((p) => {
            const count = partCounts[p.part] ?? 0;
            return (
              <button
                key={p.part}
                type="button"
                onClick={() => handleBank(p.part)}
                disabled={loadingPart !== null || count === 0}
                className="flex flex-col items-start gap-1 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-brand disabled:opacity-50"
              >
                <span className="text-base font-semibold text-brand">{p.label}</span>
                <span className="text-xs text-brand-muted">{p.desc}</span>
                <span className="mt-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  {loadingPart === p.part ? "Đang tải..." : `${count} câu`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-accent/30 bg-accent/5 p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold text-brand">Luyện marathon</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Mỗi phiên {PRACTICE_SESSION.min}–{PRACTICE_SESSION.max} câu — lấy ngẫu nhiên từ database
          (câu đã import) và bổ sung bài mẫu nếu thiếu.
        </p>
        <div className="mt-4 space-y-2">
          <span className="text-sm text-brand">Số câu mỗi phiên</span>
          {countPresets(marathonCount, setMarathonCount, "marathon")}
        </div>
        <button
          type="button"
          onClick={handleMarathon}
          disabled={loadingMarathon}
          className="touch-target mt-4 w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
        >
          {loadingMarathon ? "Đang tải đề..." : `Bắt đầu luyện ${marathonCount} câu`}
        </button>
      </section>

      {(showGenerator || !settings.apiKey) && (
        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-brand">Tạo đề mới bằng AI</h2>
          <p className="mt-1 text-sm text-brand-muted">
            AI tạo {PRACTICE_SESSION.min}–{PRACTICE_SESSION.max} câu Part 5 kèm giải thích tiếng Việt
            (chia batch, có thể mất 2–5 phút).
          </p>
          {!settings.apiKey && (
            <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Chưa có API key. Vào{" "}
              <a href="/settings" className="underline">
                Cài đặt
              </a>{" "}
              để thêm OpenAI API key.
            </p>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-brand">Loại câu hỏi</span>
              <select
                value={genForm.category}
                onChange={(e) =>
                  setGenForm((f) => ({
                    ...f,
                    category: e.target.value as GenerateQuizRequest["category"],
                  }))
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                <option value="mixed">{CATEGORY_LABELS.mixed}</option>
                {PART5_CATEGORIES.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm text-brand">Số câu</span>
              {countPresets(
                genForm.count ?? PRACTICE_SESSION.default,
                (n) => setGenForm((f) => ({ ...f, count: n })),
                "gen"
              )}
              <input
                type="number"
                min={PRACTICE_SESSION.min}
                max={PRACTICE_SESSION.max}
                value={genForm.count}
                onChange={(e) =>
                  setGenForm((f) => ({
                    ...f,
                    count: clampPracticeCount(Number(e.target.value)),
                  }))
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              />
            </div>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-brand">Chủ đề / ngữ cảnh</span>
              <input
                value={genForm.topic}
                onChange={(e) => setGenForm((f) => ({ ...f, topic: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
                placeholder="VD: HR, logistics, marketing, finance..."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-brand">Độ khó</span>
              <select
                value={genForm.difficulty}
                onChange={(e) =>
                  setGenForm((f) => ({
                    ...f,
                    difficulty: e.target.value as GenerateQuizRequest["difficulty"],
                  }))
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm text-brand">Model AI</span>
              <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand">
                {models.find((m) => m.id === settings.modelId)?.displayName ??
                  settings.modelId}
              </div>
              <a href="/settings" className="text-xs text-accent underline">
                Đổi model trong Cài đặt
              </a>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !settings.apiKey}
            className="touch-target mt-4 w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-50 sm:w-auto"
          >
            {generating
              ? `Đang tạo ~${clampPracticeCount(genForm.count ?? PRACTICE_SESSION.default)} câu (2–5 phút)...`
              : `Tạo ${clampPracticeCount(genForm.count ?? PRACTICE_SESSION.default)} câu mới`}          </button>
        </section>
      )}

      {!showSummary && currentQuestion && (
        <>
          <div className="flex flex-col gap-2 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              Tiến độ: {currentIndex + 1}/{quiz.questions.length}
            </span>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface sm:w-40">
              <div
                className="h-full bg-brand transition-all"
                style={{
                  width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <p className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-brand-muted">
            💡 Gặp từ chưa nhớ? <span className="font-medium text-brand">Bôi đen (highlight)</span>{" "}
            từ đó để lưu vào danh sách <a href="/vocabulary?tab=saved" className="text-accent underline">Cần nhớ</a> và ôn lại sau.
          </p>

          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            selectedIndex={selectedIndex}
            showResult={showResult}
            onSelect={handleSelect}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            {!showResult ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={selectedIndex === null}
                className="touch-target w-full rounded-xl border border-brand bg-white px-5 py-3 text-sm font-semibold text-brand disabled:opacity-40 sm:w-auto"
              >
                Kiểm tra đáp án
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="touch-target w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                {currentIndex < quiz.questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
              </button>
            )}
          </div>
        </>
      )}

      {showSummary && (
        <section className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm sm:p-8">
          <p className="text-sm uppercase tracking-wider text-accent">Hoàn thành</p>
          <h2 className="mt-2 text-3xl font-bold text-brand sm:text-4xl">
            {score}/{quiz.questions.length}
          </h2>
          <p className="mt-2 text-sm text-brand-muted sm:text-base">
            Bạn trả lời đúng {Math.round((score / quiz.questions.length) * 100)}%
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="touch-target w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white sm:w-auto"
            >
              Làm lại
            </button>
            <a
              href="/vocabulary"
              className="touch-target flex w-full items-center justify-center rounded-xl border border-border px-5 py-3 text-sm text-brand sm:w-auto"
            >
              Xem từ vựng
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<p className="text-brand-muted">Đang tải...</p>}>
      <PracticeContent />
    </Suspense>
  );
}
