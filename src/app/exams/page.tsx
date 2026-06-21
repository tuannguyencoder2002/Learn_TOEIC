"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface ExamSet {
  id: string;
  title: string;
  source_type: string;
  category: string | null;
  part_number: number;
  question_count: number;
  created_at: string;
}

const SOURCE_META: Record<string, { label: string; cls: string }> = {
  ai_generate: { label: "AI tạo", cls: "bg-accent/10 text-accent" },
  image_import: { label: "Từ ảnh", cls: "bg-emerald-100 text-emerald-800" },
  seed: { label: "Bài mẫu", cls: "bg-surface text-brand-muted" },
  manual: { label: "Thủ công", cls: "bg-surface text-brand-muted" },
};

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "ai_generate", label: "AI tạo" },
  { value: "image_import", label: "Từ ảnh" },
  { value: "seed", label: "Bài mẫu" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

export default function ExamsPage() {
  const [sets, setSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/practice?action=sets")
      .then((res) => res.json())
      .then((data) => setSets((data.sets ?? []) as ExamSet[]))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? sets : sets.filter((s) => s.source_type === filter)),
    [sets, filter]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-accent">Kho đề</p>
        <h1 className="text-xl font-bold text-brand sm:text-2xl">Danh sách đề</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Chọn một đề để luyện. Mỗi lần bạn tạo đề mới bằng AI, đề sẽ tự động xuất hiện ở đây.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === f.value
                ? "bg-brand text-white"
                : "bg-surface text-brand-muted hover:text-brand"
            }`}
          >
            {f.label}
          </button>
        ))}
        <Link
          href="/practice?mode=generate"
          className="ml-auto rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/5"
        >
          + Tạo đề mới
        </Link>
      </div>

      {loading ? (
        <p className="text-brand-muted">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
          <p className="text-3xl">📝</p>
          <p className="mt-3 text-sm font-medium text-brand">Chưa có đề nào</p>
          <p className="mt-1 text-sm text-brand-muted">
            Vào trang{" "}
            <Link href="/practice?mode=generate" className="text-accent underline">
              Luyện tập
            </Link>{" "}
            để tạo đề mới bằng AI — đề sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => {
            const meta =
              SOURCE_META[s.source_type] ?? {
                label: s.source_type,
                cls: "bg-surface text-brand-muted",
              };
            return (
              <Link
                key={s.id}
                href={`/practice?set=${s.id}`}
                className="group flex flex-col rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                    Part {s.part_number}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.cls}`}>
                    {meta.label}
                  </span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-brand-muted">
                    {s.question_count} câu
                  </span>
                </div>
                <h2 className="mt-2 line-clamp-2 font-semibold text-brand group-hover:text-accent">
                  {s.title}
                </h2>
                <p className="mt-1 text-xs text-brand-muted">{formatDate(s.created_at)}</p>
                <span className="mt-3 text-xs font-medium text-accent">Bắt đầu làm →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
