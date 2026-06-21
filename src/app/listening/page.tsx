"use client";

import { useMemo, useState } from "react";
import { ListeningPart1Card } from "@/components/ListeningPart1Card";
import { ListeningFocus } from "@/components/ListeningFocus";
import { OFFICIAL_LISTENING_RESOURCES } from "@/lib/listening-resources";
import { PART1_SEED } from "@/lib/listening-part1-seed";

type Tab = "focus" | "links" | "part1";

export default function ListeningPage() {
  const [tab, setTab] = useState<Tab>("focus");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const current = PART1_SEED[currentIndex];
  const selectedIndex = current ? (answers[current.id] ?? null) : null;

  const score = useMemo(() => {
    let correct = 0;
    for (const q of PART1_SEED) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    return correct;
  }, [answers]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setShowSummary(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-accent">TOEIC Listening</p>
        <h1 className="text-xl font-bold text-brand sm:text-2xl">Luyện nghe & nguồn chính thức</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Link miễn phí từ ETS / IIG / BBC — và Part 1 mẫu với ảnh stock (không crawl đề có bản
          quyền).
        </p>
      </div>

      <div className="flex gap-2 rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab("focus")}
          className={`touch-target flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            tab === "focus" ? "bg-brand text-white" : "text-brand-muted hover:text-brand"
          }`}
        >
          🎯 Trọng tâm
        </button>
        <button
          type="button"
          onClick={() => setTab("links")}
          className={`touch-target flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            tab === "links" ? "bg-brand text-white" : "text-brand-muted hover:text-brand"
          }`}
        >
          🔗 Nguồn free
        </button>
        <button
          type="button"
          onClick={() => setTab("part1")}
          className={`touch-target flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            tab === "part1" ? "bg-brand text-white" : "text-brand-muted hover:text-brand"
          }`}
        >
          🖼️ Part 1 mẫu
        </button>
      </div>

      {tab === "focus" && <ListeningFocus />}

      {tab === "links" && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            App mở link ra trình duyệt — bạn luyện trực tiếp trên trang ETS/IIG. Không tự động tải
            hay copy nội dung có bản quyền.
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            {OFFICIAL_LISTENING_RESOURCES.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    {item.provider}
                  </span>
                  {item.free && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                      Free
                    </span>
                  )}
                  {item.hasAudio && (
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-brand-muted">
                      🔊 Audio
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-semibold text-brand group-hover:text-accent">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-brand-muted">{item.parts}</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{item.description}</p>
                <p className="mt-3 text-xs font-medium text-accent">Mở trang →</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {tab === "part1" && (
        <div className="space-y-4">
          <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-brand-muted">
            <strong className="text-brand">Part 1 thi thật:</strong> xem ảnh + nghe 4 câu mô tả.
            Ở đây là chế độ <em>đọc</em> 4 lựa chọn — luyện từ vựng mô tả hình ảnh. ({PART1_SEED.length}{" "}
            câu mẫu)
          </p>

          {!showSummary && current && (
            <>
              <p className="text-sm text-brand-muted">
                Tiến độ: {currentIndex + 1}/{PART1_SEED.length}
              </p>
              <ListeningPart1Card
                question={current}
                index={currentIndex}
                selectedIndex={selectedIndex}
                showResult={showResult}
                onSelect={(idx) =>
                  !showResult && setAnswers((p) => ({ ...p, [current.id]: idx }))
                }
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                {!showResult ? (
                  <button
                    type="button"
                    onClick={() => selectedIndex !== null && setShowResult(true)}
                    disabled={selectedIndex === null}
                    className="touch-target w-full rounded-xl border border-brand bg-white px-5 py-3 text-sm font-semibold text-brand disabled:opacity-40 sm:w-auto"
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentIndex < PART1_SEED.length - 1) {
                        setCurrentIndex((i) => i + 1);
                        setShowResult(false);
                      } else {
                        setShowSummary(true);
                      }
                    }}
                    className="touch-target w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white sm:w-auto"
                  >
                    {currentIndex < PART1_SEED.length - 1 ? "Câu tiếp" : "Xem kết quả"}
                  </button>
                )}
              </div>
            </>
          )}

          {showSummary && (
            <section className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-accent">Hoàn thành Part 1 mẫu</p>
              <h2 className="mt-2 text-3xl font-bold text-brand">
                {score}/{PART1_SEED.length}
              </h2>
              <p className="mt-2 text-sm text-brand-muted">
                Luyện audio thật qua tab &quot;Nguồn free&quot; → ETS / IIBC sample.
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="touch-target mt-4 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white"
              >
                Làm lại
              </button>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
