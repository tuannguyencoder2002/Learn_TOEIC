"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiHeaders, useAppSettings } from "@/hooks/useAppSettings";
import { compressImagesForImport } from "@/lib/compress-image";
import type { ImportQuestionDisplay } from "@/lib/import-display";
import { ImportReviewList } from "@/components/ImportReviewCard";

interface ImageEntry {
  id: string;
  file: File;
  previewUrl: string;
}

const ACCEPTED_IMAGE = /^image\/(png|jpe?g|webp|gif|heic|heif)$/i;
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|heic|heif)$/i;

function isImageFile(file: File) {
  if (ACCEPTED_IMAGE.test(file.type)) return true;
  if (!file.type && IMAGE_EXT.test(file.name)) return true;
  return false;
}

function fileFromClipboardItem(item: DataTransferItem, index: number): File | null {
  if (item.kind !== "file" || !item.type.startsWith("image/")) return null;
  const blob = item.getAsFile();
  if (!blob) return null;
  const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  return new File([blob], `pasted-${Date.now()}-${index}.${ext}`, { type: blob.type });
}

function createEntry(file: File): ImageEntry {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export default function ImportPage() {
  const { settings, loaded } = useAppSettings();
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [pasteHint, setPasteHint] = useState(false);
  const [result, setResult] = useState<{
    questionCount: number;
    imageCount: number;
    reviewSummaryVi: string | null;
    setId: string;
    title?: string;
    questions: ImportQuestionDisplay[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokeAll = useCallback((entries: ImageEntry[]) => {
    for (const entry of entries) URL.revokeObjectURL(entry.previewUrl);
  }, []);

  const addFiles = useCallback(
    async (incoming: File[], mode: "append" | "replace" = "append") => {
      const valid = incoming.filter(isImageFile);
      if (!valid.length) {
        if (incoming.length) {
          setError(
            "Không nhận được ảnh. Thử chụp JPG/PNG hoặc chọn ảnh khác (iPhone HEIC cũng được).",
          );
        }
        return;
      }

      setError(null);
      setResult(null);
      setPasteHint(false);
      setCompressing(true);

      try {
        const compressed = await compressImagesForImport(valid);
        const entries = compressed.map(createEntry);
        setImages((prev) => {
          if (mode === "replace") {
            revokeAll(prev);
            return entries;
          }
          const existing = new Set(
            prev.map((e) => `${e.file.name}:${e.file.size}:${e.file.lastModified}`),
          );
          const unique = entries.filter(
            (e) => !existing.has(`${e.file.name}:${e.file.size}:${e.file.lastModified}`),
          );
          return [...prev, ...unique];
        });
      } finally {
        setCompressing(false);
      }
    },
    [revokeAll],
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
    setResult(null);
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      revokeAll(prev);
      return [];
    });
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [revokeAll]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pasted: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const file = fileFromClipboardItem(items[i], i);
        if (file) pasted.push(file);
      }

      if (pasted.length) {
        e.preventDefault();
        addFiles(pasted);
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  useEffect(() => {
    return () => revokeAll(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImport = async () => {
    if (!images.length || loading || compressing) return;

    setLoading(true);
    setError(null);
    setLoadingStage("AI đang đọc ảnh...");

    try {
      const formData = new FormData();
      for (const entry of images) {
        formData.append("images", entry.file);
      }
      if (settings.apiKey) {
        formData.append("apiKey", settings.apiKey);
      }
      formData.append("modelId", settings.modelId);
      if (title) formData.append("title", title);

      const res = await fetch("/api/import/image", {
        method: "POST",
        headers: getApiHeaders(settings.apiKey),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult({
        questionCount: data.questionCount,
        imageCount: data.imageCount ?? images.length,
        reviewSummaryVi: data.reviewSummaryVi,
        setId: data.setId,
        title: data.title,
        questions: data.questions ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import thất bại");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  if (!loaded) return <p className="text-brand-muted">Đang tải...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-accent">Import bài tập</p>
        <h1 className="text-xl font-bold text-brand sm:text-2xl">Gửi ảnh → Dịch + Giải + Lưu DB</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Chụp hoặc chọn ảnh trang sách Part 5 — AI trích câu, dịch tiếng Việt và hướng dẫn chọn dạng
          từ như sách luyện thi.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
        <label className="block space-y-2">
          <span className="text-sm text-brand">Tiêu đề bài (tuỳ chọn)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Unit 5 - Word Forms"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-brand">Ảnh bài tập</span>
            {images.length > 0 && (
              <span className="text-xs text-brand-muted">{images.length} ảnh</span>
            )}
          </div>

          <div
            tabIndex={0}
            onFocus={() => setPasteHint(true)}
            onBlur={() => setPasteHint(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setPasteHint(true);
            }}
            onDragLeave={() => setPasteHint(false)}
            onDrop={(e) => {
              e.preventDefault();
              setPasteHint(false);
              addFiles(Array.from(e.dataTransfer.files));
            }}
            className={`rounded-2xl border-2 border-dashed p-4 text-center transition sm:p-6 ${
              pasteHint
                ? "border-accent bg-accent/5"
                : "border-border bg-surface hover:border-brand-muted"
            }`}
          >
            {compressing ? (
              <p className="text-sm text-accent">Đang nén ảnh...</p>
            ) : images.length === 0 ? (
              <>
                <p className="text-4xl">📋</p>
                <p className="mt-3 text-sm font-medium text-brand hidden sm:block">
                  Dán ảnh tại đây (Ctrl+V)
                </p>
                <p className="mt-3 text-sm font-medium text-brand sm:hidden">
                  Chọn ảnh bên dưới
                </p>
                <p className="mt-1 text-xs text-brand-muted hidden sm:block">
                  Hỗ trợ nhiều ảnh · kéo thả · hoặc chọn file bên dưới
                </p>
              </>
            ) : (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="group relative overflow-hidden rounded-xl border border-border bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.previewUrl}
                        alt={`Trang ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <div className="absolute left-2 top-2 rounded-md bg-brand/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(entry.id)}
                        className="absolute right-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-xs text-rose-600 shadow hover:bg-white"
                        aria-label={`Xóa ảnh ${index + 1}`}
                      >
                        ✕
                      </button>
                      <p className="truncate px-2 py-1 text-[10px] text-brand-muted">
                        {entry.file.name}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-brand-muted hidden sm:block">
                  Tiếp tục Ctrl+V hoặc kéo thả để thêm ảnh
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={clearImages}
                    className="text-sm text-rose-600 hover:underline"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? []);
              if (selected.length) addFiles(selected);
              e.target.value = "";
            }}
            className="sr-only"
            id="import-file-input"
          />
          <label
            htmlFor="import-file-input"
            className="touch-target flex w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-brand active:bg-accent/10"
          >
            📷 Chọn ảnh từ điện thoại / máy
          </label>
          <p className="text-center text-xs text-brand-muted">
            JPG, PNG, WEBP, HEIC · có thể chọn nhiều ảnh
          </p>
        </div>

        {!settings.apiKey && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Chưa có API key trên trình duyệt này — app sẽ dùng key trong{" "}
            <code className="text-xs">.env.local</code> trên PC nếu đã cấu hình. Hoặc vào{" "}
            <a href="/settings" className="underline">
              Cài đặt
            </a>{" "}
            trên điện thoại.
          </p>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={!images.length || loading || compressing}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50 touch-manipulation min-h-[48px]"
        >
          {loading ?
            loadingStage || `AI đang đọc & giải ${images.length} ảnh...`
          : compressing ?
            "Đang nén ảnh..."
          : images.length > 1 ?
            `Import ${images.length} ảnh & Lưu vào Database`
          : "Import & Lưu vào Database"}
        </button>
      </section>

      {error && (
        <p className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-900">
              Đã xử lý <strong>{result.imageCount}</strong> ảnh ·{" "}
              <strong>{result.questionCount}</strong> câu đã lưu vào database.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <a
                href="/review"
                className="touch-target flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
              >
                Ôn tập SRS
              </a>
              <a
                href="/practice"
                className="touch-target flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm text-brand"
              >
                Luyện Part 5
              </a>
            </div>
          </section>

          <ImportReviewList
            items={result.questions}
            title={result.title ?? "Kết quả giải bài"}
            summary={result.reviewSummaryVi}
          />
        </div>
      )}
    </div>
  );
}
