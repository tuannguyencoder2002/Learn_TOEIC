"use client";

import { useEffect, useState } from "react";
import { ModelSelector } from "@/components/ModelSelector";
import { getApiHeaders, useAppSettings } from "@/hooks/useAppSettings";
import type { CursorModel } from "@/lib/types";

export default function SettingsPage() {
  const { settings, saveSettings, loaded } = useAppSettings();
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("gpt-4o-mini");
  const [models, setModels] = useState<CursorModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) return;
    setApiKey(settings.apiKey);
    setModelId(settings.modelId === "auto" ? "gpt-4o-mini" : settings.modelId);
  }, [loaded, settings]);

  const loadModels = async (key: string) => {
    if (!key) return;
    setLoadingModels(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/models", { headers: getApiHeaders(key) });
      const text = await res.text();
      let data: { error?: string; models?: CursorModel[] };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("API không phản hồi JSON — thử khởi động lại app (start.bat)");
      }
      if (!res.ok) throw new Error(data.error || "Không tải được model");
      setModels(data.models ?? []);
      setTestResult(`Kết nối OK · ${data.models?.length ?? 0} model`);
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : "Lỗi kết nối");
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = () => {
    saveSettings({ apiKey: apiKey.trim(), modelId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (apiKey.trim()) loadModels(apiKey.trim());
  };

  if (!loaded) return <p className="text-brand-muted">Đang tải...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-accent">Cấu hình</p>
        <h1 className="text-xl font-bold text-brand sm:text-2xl">OpenAI API & Model</h1>
        <p className="mt-2 text-sm text-brand-muted">
          API key được lưu trên trình duyệt (localStorage). Không commit vào git.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-brand">OpenAI API Key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2"
          />
          <p className="text-xs text-brand-muted">
            Lấy key tại{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline"
            >
              OpenAI Platform → API keys
            </a>
            . Hoặc đặt <code className="text-xs">OPENAI_API_KEY</code> trong{" "}
            <code className="text-xs">.env.local</code>.
          </p>
        </label>

        <ModelSelector
          models={models}
          value={modelId}
          onChange={setModelId}
          loading={loadingModels}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="touch-target w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            {saved ? "Đã lưu ✓" : "Lưu cài đặt"}
          </button>
          <button
            type="button"
            onClick={() => loadModels(apiKey.trim())}
            disabled={!apiKey.trim() || loadingModels}
            className="touch-target w-full rounded-xl border border-border px-5 py-3 text-sm text-brand disabled:opacity-40 sm:w-auto"
          >
            Test kết nối
          </button>
        </div>

        {testResult && (
          <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-brand-muted">
            {testResult}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:p-5">
        <h2 className="font-semibold text-brand">Model gợi ý</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-brand-muted">
          <li>
            <strong>gpt-4o-mini</strong> — nhanh, rẻ, phù hợp tạo đề và dịch từ vựng.
          </li>
          <li>
            <strong>gpt-4o</strong> — chất lượng cao hơn, phù hợp import ảnh phức tạp.
          </li>
          <li>
            Import ảnh dùng vision — cần model hỗ trợ hình ảnh (gpt-4o, gpt-4o-mini).
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
        <h2 className="font-semibold text-amber-900">Lưu ý bảo mật</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800/90">
          <li>Không chia sẻ API key công khai (chat, screenshot, GitHub).</li>
          <li>Nếu key đã lộ, hãy revoke và tạo key mới trên OpenAI Platform.</li>
          <li>Key lưu localStorage chỉ dùng cho app cá nhân trên máy bạn.</li>
        </ul>
      </section>
    </div>
  );
}
