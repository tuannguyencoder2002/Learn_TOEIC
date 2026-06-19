"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiHeaders, useAppSettings } from "@/hooks/useAppSettings";

interface SavedWord {
  vocabulary_id: string;
  word: string;
  meaning_vi: string | null;
  part_of_speech: string | null;
  example_en: string | null;
  context_en: string | null;
  note: string | null;
  mastery_level: number;
  times_seen: number;
  times_correct: number;
  next_review_at: string | null;
  is_due: boolean;
}

type View = "review" | "manage";

const MASTERY_LABELS = ["Mới", "Đang học", "Khá", "Đã nhớ"];

export function SavedWords() {
  const { settings } = useAppSettings();
  const [words, setWords] = useState<SavedWord[]>([]);
  const [counts, setCounts] = useState({ total: 0, due: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("review");

  // Review state
  const [queue, setQueue] = useState<SavedWord[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [draftMeaning, setDraftMeaning] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vocabulary/save");
      const data = await res.json();
      setWords(data.words ?? []);
      setCounts(data.counts ?? { total: 0, due: 0 });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startReview = () => {
    const due = words.filter((w) => w.is_due && w.mastery_level < 3);
    const pool = due.length > 0 ? due : words;
    setQueue(pool);
    setCardIndex(0);
    setRevealed(false);
    setFinished(false);
    setDraftMeaning("");
    setView("review");
  };

  const current = queue[cardIndex];

  const reveal = () => {
    setRevealed(true);
    setDraftMeaning(current?.meaning_vi ?? "");
  };

  const handleReview = async (remembered: boolean) => {
    if (!current) return;
    try {
      await fetch("/api/vocabulary/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabularyId: current.vocabulary_id, remembered }),
      });
    } catch {
      // ignore
    }

    if (cardIndex < queue.length - 1) {
      setCardIndex((i) => i + 1);
      setRevealed(false);
      setDraftMeaning("");
    } else {
      setFinished(true);
      load();
    }
  };

  const saveMeaning = async (vocabularyId: string, meaning: string) => {
    await fetch("/api/vocabulary/save", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabularyId, meaning }),
    });
    setWords((prev) =>
      prev.map((w) => (w.vocabulary_id === vocabularyId ? { ...w, meaning_vi: meaning } : w))
    );
    setQueue((prev) =>
      prev.map((w) => (w.vocabulary_id === vocabularyId ? { ...w, meaning_vi: meaning } : w))
    );
  };

  const aiTranslate = async (w: SavedWord) => {
    setTranslating(true);
    try {
      const res = await fetch("/api/vocabulary/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders(settings.apiKey) },
        body: JSON.stringify({
          word: w.word,
          context: w.context_en,
          vocabularyId: w.vocabulary_id,
        }),
      });
      const data = await res.json();
      if (data.ok && data.meaning) {
        setDraftMeaning(data.meaning);
        setWords((prev) =>
          prev.map((x) =>
            x.vocabulary_id === w.vocabulary_id ? { ...x, meaning_vi: data.meaning } : x
          )
        );
        setQueue((prev) =>
          prev.map((x) =>
            x.vocabulary_id === w.vocabulary_id ? { ...x, meaning_vi: data.meaning } : x
          )
        );
      } else {
        alert(data.error || "AI chưa dịch được — bạn tự nhập nghĩa nhé.");
      }
    } catch {
      alert("Không gọi được AI. Bạn tự nhập nghĩa nhé.");
    } finally {
      setTranslating(false);
    }
  };

  const handleDelete = async (vocabularyId: string) => {
    await fetch(`/api/vocabulary/save?id=${vocabularyId}`, { method: "DELETE" });
    setWords((prev) => prev.filter((w) => w.vocabulary_id !== vocabularyId));
    setCounts((c) => ({ total: Math.max(0, c.total - 1), due: c.due }));
  };

  if (loading) return <p className="text-brand-muted">Đang tải...</p>;

  if (words.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
        <p className="text-3xl">📌</p>
        <p className="mt-3 text-sm font-medium text-brand">Chưa có từ nào được lưu</p>
        <p className="mt-1 text-sm text-brand-muted">
          Vào trang <a href="/practice" className="text-accent underline">Luyện tập</a>, khi gặp từ
          chưa nhớ thì <span className="font-medium">bôi đen (highlight)</span> từ đó để lưu vào đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={startReview}
            className={`touch-target rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "review" ? "bg-brand text-white" : "text-brand-muted hover:text-brand"
            }`}
          >
            🔁 Ôn lại
          </button>
          <button
            type="button"
            onClick={() => setView("manage")}
            className={`touch-target rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "manage" ? "bg-brand text-white" : "text-brand-muted hover:text-brand"
            }`}
          >
            📋 Danh sách ({counts.total})
          </button>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          {counts.due} từ cần ôn hôm nay
        </span>
      </div>

      {view === "review" ? (
        <ReviewCard
          current={current}
          queue={queue}
          cardIndex={cardIndex}
          revealed={revealed}
          finished={finished}
          draftMeaning={draftMeaning}
          translating={translating}
          hasApiKey={Boolean(settings.apiKey)}
          onReveal={reveal}
          onReview={handleReview}
          onRestart={startReview}
          onDraftChange={setDraftMeaning}
          onSaveMeaning={saveMeaning}
          onAiTranslate={aiTranslate}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {words.map((w) => (
            <article
              key={w.vocabulary_id}
              className="rounded-2xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-brand">{w.word}</h3>
                <button
                  type="button"
                  onClick={() => handleDelete(w.vocabulary_id)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
              {w.meaning_vi ? (
                <p className="mt-1 text-sm text-accent">{w.meaning_vi}</p>
              ) : (
                <p className="mt-1 text-xs italic text-amber-700">Chưa có nghĩa — vào "Ôn lại" để thêm</p>
              )}
              {w.context_en && (
                <p className="mt-2 text-xs italic leading-relaxed text-brand-muted">“{w.context_en}”</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-brand-muted">
                  {MASTERY_LABELS[w.mastery_level] ?? "Mới"}
                </span>
                {w.is_due && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">
                    Cần ôn
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  current,
  queue,
  cardIndex,
  revealed,
  finished,
  draftMeaning,
  translating,
  hasApiKey,
  onReveal,
  onReview,
  onRestart,
  onDraftChange,
  onSaveMeaning,
  onAiTranslate,
}: {
  current: SavedWord | undefined;
  queue: SavedWord[];
  cardIndex: number;
  revealed: boolean;
  finished: boolean;
  draftMeaning: string;
  translating: boolean;
  hasApiKey: boolean;
  onReveal: () => void;
  onReview: (remembered: boolean) => void;
  onRestart: () => void;
  onDraftChange: (v: string) => void;
  onSaveMeaning: (id: string, meaning: string) => void;
  onAiTranslate: (w: SavedWord) => void;
}) {
  if (queue.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-brand-muted">Nhấn “🔁 Ôn lại” để bắt đầu ôn các từ đã lưu.</p>
      </div>
    );
  }

  if (finished || !current) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center">
        <p className="text-3xl">🎉</p>
        <p className="mt-2 text-sm font-semibold text-emerald-900">
          Đã ôn xong {queue.length} từ!
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-4 touch-target rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Ôn lại lần nữa
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between text-xs text-brand-muted">
        <span>
          Thẻ {cardIndex + 1}/{queue.length}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${((cardIndex + 1) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="py-4 text-center">
        <h2 className="text-2xl font-bold text-brand sm:text-3xl">{current.word}</h2>
        {current.context_en && (
          <p className="mx-auto mt-3 max-w-md text-xs italic leading-relaxed text-brand-muted">
            “{current.context_en}”
          </p>
        )}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={onReveal}
          className="touch-target w-full rounded-xl border border-brand bg-white py-3 text-sm font-semibold text-brand"
        >
          Hiện nghĩa
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            {current.meaning_vi ? (
              <>
                <p className="text-lg font-semibold text-accent">{current.meaning_vi}</p>
                {current.part_of_speech && (
                  <p className="mt-1 text-xs text-brand-muted">({current.part_of_speech})</p>
                )}
                {current.example_en && (
                  <p className="mt-2 text-xs italic text-brand-muted">{current.example_en}</p>
                )}
              </>
            ) : (
              <div className="space-y-2 text-left">
                <p className="text-xs text-amber-700">Từ này chưa có nghĩa — thêm để ôn cho dễ nhớ:</p>
                <input
                  value={draftMeaning}
                  onChange={(e) => onDraftChange(e.target.value)}
                  placeholder="Nhập nghĩa tiếng Việt..."
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSaveMeaning(current.vocabulary_id, draftMeaning)}
                    disabled={!draftMeaning.trim()}
                    className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Lưu nghĩa
                  </button>
                  {hasApiKey && (
                    <button
                      type="button"
                      onClick={() => onAiTranslate(current)}
                      disabled={translating}
                      className="rounded-lg border border-accent px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-50"
                    >
                      {translating ? "AI đang dịch..." : "✨ AI dịch"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onReview(false)}
              className="touch-target rounded-xl border border-rose-300 bg-rose-50 py-3 text-sm font-semibold text-rose-700"
            >
              Chưa nhớ
            </button>
            <button
              type="button"
              onClick={() => onReview(true)}
              className="touch-target rounded-xl border border-emerald-300 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700"
            >
              Đã nhớ ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
