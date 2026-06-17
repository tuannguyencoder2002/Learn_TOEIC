"use client";

import type { CursorModel } from "@/lib/types";

interface ModelSelectorProps {
  models: CursorModel[];
  value: string;
  onChange: (modelId: string) => void;
  loading?: boolean;
}

export function ModelSelector({
  models,
  value,
  onChange,
  loading,
}: ModelSelectorProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-brand">Model AI</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand outline-none ring-accent/20 focus:ring-2 disabled:opacity-50"
      >
        {models.length === 0 ? (
          <option value={value}>{value || "auto"}</option>
        ) : (
          models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.displayName}
            </option>
          ))
        )}
      </select>
      {loading && (
        <p className="text-xs text-brand-muted">Đang tải danh sách model...</p>
      )}
    </label>
  );
}
