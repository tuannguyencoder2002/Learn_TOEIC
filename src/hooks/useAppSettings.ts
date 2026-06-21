"use client";

import { useEffect, useState } from "react";
import type { AppSettings } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/types";

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
  modelId: "gpt-4o-mini",
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings);
      if (raw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const saveSettings = (next: AppSettings) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
  };

  return { settings, saveSettings, loaded };
}

export function getApiHeaders(apiKey?: string): HeadersInit {
  if (!apiKey) return {};
  return { "x-openai-api-key": apiKey };
}
