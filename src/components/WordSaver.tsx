"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiHeaders, useAppSettings } from "@/hooks/useAppSettings";

interface FloatingState {
  word: string;
  context: string;
  x: number;
  y: number;
}

interface ToastState {
  text: string;
  tone: "ok" | "err";
}

/** Lọc cụm bôi đen: chỉ chấp nhận 1–4 từ tiếng Anh, bỏ ký tự thừa. */
function cleanSelection(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  // Bỏ dấu câu ở đầu/cuối
  const cleaned = trimmed.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
  if (!cleaned) return null;
  const words = cleaned.split(" ");
  if (words.length > 4) return null;
  if (cleaned.length > 50) return null;
  if (!/[A-Za-z]/.test(cleaned)) return null;
  return cleaned;
}

export function WordSaver({
  children,
  className,
  onSaved,
}: {
  children: React.ReactNode;
  className?: string;
  onSaved?: () => void;
}) {
  const { settings } = useAppSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState<FloatingState | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((text: string, tone: "ok" | "err") => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setFloating(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setFloating(null);
      return;
    }

    const word = cleanSelection(selection.toString());
    if (!word) {
      setFloating(null);
      return;
    }

    // Câu chứa từ = text của khối gần nhất
    const anchorEl =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : (range.startContainer as HTMLElement);
    const context = (anchorEl?.textContent ?? "").trim().slice(0, 500);

    const rect = range.getBoundingClientRect();
    setFloating({
      word,
      context,
      x: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80),
      y: rect.top,
    });
  }, []);

  useEffect(() => {
    const onUp = () => window.setTimeout(handleSelection, 10);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, [handleSelection]);

  const handleSave = async () => {
    if (!floating || saving) return;
    setSaving(true);
    const { word, context } = floating;

    try {
      const res = await fetch("/api/vocabulary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");

      let meaning: string = data.saved?.meaning ?? "";
      const vocabularyId: string | undefined = data.saved?.vocabularyId;

      // Chưa có nghĩa + có API key → nhờ AI dịch
      if (!meaning && settings.apiKey && vocabularyId) {
        try {
          const tr = await fetch("/api/vocabulary/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getApiHeaders(settings.apiKey) },
            body: JSON.stringify({ word, context, vocabularyId }),
          });
          const trData = await tr.json();
          if (trData.ok && trData.meaning) meaning = trData.meaning;
        } catch {
          // bỏ qua — vẫn lưu được, để người dùng tự thêm nghĩa
        }
      }

      showToast(
        meaning ? `✓ Đã lưu "${word}" — ${meaning}` : `✓ Đã lưu "${word}" (thêm nghĩa ở tab Cần nhớ)`,
        "ok"
      );
      onSaved?.();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Lưu thất bại", "err");
    } finally {
      setSaving(false);
      setFloating(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div ref={containerRef} className={className}>
      {children}

      {floating && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSave}
          disabled={saving}
          style={{
            position: "fixed",
            left: floating.x,
            top: Math.max(floating.y - 46, 8),
            transform: "translateX(-50%)",
            zIndex: 60,
          }}
          className="flex items-center gap-1 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white shadow-lg ring-2 ring-white active:scale-95"
        >
          {saving ? "Đang lưu..." : `💾 Lưu "${floating.word}"`}
        </button>
      )}

      {toast && (
        <div
          style={{ paddingBottom: "calc(var(--safe-bottom) + 72px)" }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4"
        >
          <p
            className={`max-w-md rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
              toast.tone === "ok"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {toast.text}
          </p>
        </div>
      )}
    </div>
  );
}
