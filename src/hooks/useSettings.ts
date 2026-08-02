"use client";

import { useState } from "react";
import type { PreviewSettings } from "../types";

const defaults: PreviewSettings = {
  fontSize: 32,
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 1.35,
  color: "#222222",
  backgroundColor: "#ffffff",
  vertical: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<PreviewSettings>(defaults);
  const updateSetting = <K extends keyof PreviewSettings>(key: K, value: PreviewSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };
  return { settings, updateSetting };
}
