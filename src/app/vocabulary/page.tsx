"use client";

import { useMemo, useState } from "react";
import { VocabDuolingo } from "@/components/VocabDuolingo";
import { ALL_TOEIC_650, TOEIC_650_UNITS } from "@/lib/toeic-vocab-650";

type Tab = "learn" | "list";

export default function VocabularyPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [topicFilter, setTopicFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (topicFilter === "all") return ALL_TOEIC_650;
    return ALL_TOEIC_650.filter((w) => w.topic === topicFilter);
  }, [topicFilter]);

  const topics = useMemo(() => {
    const set = new Set(ALL_TOEIC_650.map((w) => w.topic));
    return ["all", ...Array.from(set).sort()];
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-accent">TOEIC Band 650</p>
        <h1 className="text-xl font-bold text-brand sm:text-2xl">Từ vựng & cụm từ</h1>
        <p className="mt-2 text-sm text-brand-muted">
          48 từ business phổ biến (Office, HR, Finance, Business) · học kiểu Duolingo
        </p>
      </div>

      <div className="flex gap-2 rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab("learn")}
          className={`touch-target flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
            tab === "learn"
              ? "bg-brand text-white"
              : "text-brand-muted hover:text-brand"
          }`}
        >
          🎯 Học
        </button>
        <button
          type="button"
          onClick={() => setTab("list")}
          className={`touch-target flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
            tab === "list"
              ? "bg-brand text-white"
              : "text-brand-muted hover:text-brand"
          }`}
        >
          📚 Danh sách
        </button>
      </div>

      {tab === "learn" ? (
        <VocabDuolingo />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopicFilter(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  topicFilter === t
                    ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                    : "bg-surface text-brand-muted hover:text-brand"
                }`}
              >
                {t === "all" ? "Tất cả" : t}
              </button>
            ))}
          </div>

          <p className="text-sm text-brand-muted">{filtered.length} mục</p>

          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-brand">{item.word}</h2>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-brand-muted">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-accent">{item.meaning}</p>
                <p className="mt-2 text-xs italic leading-relaxed text-brand-muted">
                  {item.example}
                </p>
                {item.exampleVi && (
                  <p className="mt-1 text-xs text-brand-muted/70">{item.exampleVi}</p>
                )}
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-brand-muted">
              Nguồn: từ vựng TOEIC band 650 theo chủ đề business (600 Essential Words / ETS
              topics). {TOEIC_650_UNITS.length} unit · {ALL_TOEIC_650.length} từ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
