"use client";

import { useState } from "react";
import { getApiHeaders, useAppSettings } from "@/hooks/useAppSettings";
import { WordSaver } from "@/components/WordSaver";
import { SpeakButton } from "@/components/SpeakButton";
import {
  LISTENING_FOCUS,
  getFocusPart,
  type FocusVocab,
} from "@/lib/listening-focus";

const LABELS = ["A", "B", "C", "D"];

interface AiQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanationVi?: string;
}
interface AiPractice {
  title: string;
  partNumber: number;
  transcript: string;
  questions: AiQuestion[];
  vocab: FocusVocab[];
}

function VocabRow({ v }: { v: FocusVocab }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-border bg-white px-3 py-2">
      <SpeakButton text={v.exampleEn || v.word} />
      <span className="font-semibold text-brand">{v.word}</span>
      {v.ipa && <span className="text-xs text-brand-muted">{v.ipa}</span>}
      {v.stress && (
        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
          {v.stress}
        </span>
      )}
      <span className="text-sm text-accent">— {v.meaningVi}</span>
      {v.exampleEn && (
        <span className="w-full text-xs italic text-brand-muted">{v.exampleEn}</span>
      )}
    </li>
  );
}

export function ListeningFocus() {
  const { settings } = useAppSettings();
  const [part, setPart] = useState<number>(1);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practice, setPractice] = useState<AiPractice | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const lesson = getFocusPart(part)!;

  const generate = async () => {
    setLoading(true);
    setError(null);
    setPractice(null);
    setAnswers({});
    try {
      const res = await fetch("/api/listening/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders(settings.apiKey) },
        body: JSON.stringify({ part, theme, modelId: settings.modelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo bài thất bại");
      setPractice(data.practice as AiPractice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Chọn Part */}
      <div className="flex flex-wrap gap-2">
        {LISTENING_FOCUS.map((p) => (
          <button
            key={p.part}
            type="button"
            onClick={() => setPart(p.part)}
            className={`touch-target rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              part === p.part
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-brand-muted hover:border-accent/40"
            }`}
          >
            {p.emoji} Part {p.part}
          </button>
        ))}
      </div>

      <WordSaver className="space-y-5">
        {/* Tổng quan */}
        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-bold text-brand">{lesson.title}</h2>
          <p className="mt-1 text-xs font-medium text-accent">{lesson.format}</p>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted">{lesson.overview}</p>
          <p className="mt-3 text-[11px] text-brand-muted/70">
            Mẹo: <strong className="text-brand">bôi đen</strong> bất kỳ từ nào để lưu vào ôn tập SRS.
          </p>
        </section>

        {/* Bẫy thường gặp */}
        <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-rose-800">⚠️ Bẫy thường gặp</h3>
          <ul className="mt-2 space-y-1.5">
            {lesson.traps.map((t, i) => (
              <li key={i} className="text-sm leading-relaxed text-brand">• {t}</li>
            ))}
          </ul>
        </section>

        {/* Cấu trúc / ngữ pháp */}
        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-bold text-brand">📐 Cấu trúc / ngữ pháp trọng tâm</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {lesson.grammarFocus.map((g, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-3">
                <p className="text-sm font-semibold text-brand">{g.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">{g.detail}</p>
                {g.exampleEn && (
                  <div className="mt-2 flex items-center gap-2">
                    <SpeakButton text={g.exampleEn} />
                    <span className="text-xs italic text-brand">{g.exampleEn}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Mẫu câu hỏi (nếu có) */}
        {lesson.patterns && (
          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-brand">🧩 Mẫu câu hỏi hay gặp</h3>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {lesson.patterns.map((p, i) => (
                <li key={i} className="text-sm text-brand-muted">• {p}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Mẹo nghe */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-emerald-800">🎧 Mẹo nghe (trọng âm / nối âm)</h3>
          <div className="mt-2 space-y-2">
            {lesson.listeningTips.map((t, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-brand">{t.title}</p>
                <p className="text-xs leading-relaxed text-brand-muted">{t.detail}</p>
                {t.exampleEn && (
                  <div className="mt-1 flex items-center gap-2">
                    <SpeakButton text={t.exampleEn} />
                    <span className="text-xs italic text-brand">{t.exampleEn}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Từ vựng theo chủ đề */}
        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-bold text-brand">📚 Từ vựng trọng tâm theo chủ đề</h3>
          <div className="mt-3 space-y-4">
            {lesson.themes.map((th) => (
              <div key={th.name}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
                  {th.name}
                </p>
                <ul className="space-y-2">
                  {th.vocab.map((v) => (
                    <VocabRow key={v.word} v={v} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* AI tạo bài nghe */}
        <section className="rounded-2xl border border-accent/30 bg-accent/5 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-brand">✨ AI tạo bài nghe luyện tập (Part {part})</h3>
          <p className="mt-1 text-xs text-brand-muted">
            Sinh 1 đoạn nghe + câu hỏi theo chủ đề. Nhấn 🔊 để nghe (giọng máy), bôi đen từ mới để lưu.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Chủ đề (vd: đặt phòng khách sạn) — để trống cũng được"
              className="flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="touch-target rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo bài"}
            </button>
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}

          {practice && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-brand">{practice.title}</p>
                  <SpeakButton text={practice.transcript} label="Nghe cả bài" rate={0.95} />
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-accent">
                    Xem transcript (thử nghe trước khi mở)
                  </summary>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand">
                    {practice.transcript}
                  </p>
                </details>
              </div>

              {practice.questions.map((q, qi) => {
                const picked = answers[qi];
                const answered = picked !== undefined;
                return (
                  <div key={qi} className="rounded-xl border border-border bg-white p-4">
                    <p className="text-sm font-medium text-brand">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="mt-2 grid gap-2">
                      {q.options.filter((o) => o !== "").map((opt, oi) => {
                        let style = "border-border bg-white text-brand hover:border-accent/40";
                        if (answered && oi === q.correctIndex)
                          style = "border-emerald-600 bg-emerald-50 text-emerald-800";
                        else if (answered && oi === picked)
                          style = "border-rose-500 bg-rose-50 text-rose-800";
                        return (
                          <button
                            key={oi}
                            type="button"
                            disabled={answered}
                            onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${style}`}
                          >
                            <span className="font-semibold">{LABELS[oi]}</span>
                            <span className="min-w-0 break-words">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    {answered && q.explanationVi && (
                      <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-brand-muted">
                        {q.explanationVi}
                      </p>
                    )}
                  </div>
                );
              })}

              {practice.vocab.length > 0 && (
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="text-sm font-bold text-brand">Từ mới trong bài</p>
                  <ul className="mt-2 space-y-2">
                    {practice.vocab.map((v) => (
                      <VocabRow key={v.word} v={v} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </WordSaver>
    </div>
  );
}
