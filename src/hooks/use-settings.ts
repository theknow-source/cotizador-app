"use client";

import { useState, useEffect, useCallback } from "react";
import type { Settings } from "@/lib/types";
import { getSettings, saveSettings } from "@/lib/storage";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const save = useCallback((newSettings: Settings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  return { settings, save };
}
