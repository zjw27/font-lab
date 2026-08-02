"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FontInfo, FontSource, LocalFontData } from "../types";
import { mockFonts } from "../utils/mockFonts";

declare global {
  interface Window { queryLocalFonts?: () => Promise<LocalFontData[]>; }
}

const sortFonts = (fonts: FontInfo[]) => [...fonts].sort((a, b) => a.fullName.localeCompare(b.fullName));

export function useFonts() {
  const [fonts, setFonts] = useState<FontInfo[]>(mockFonts);
  const [source, setSource] = useState<FontSource>("fallback");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFonts = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!("queryLocalFonts" in window)) {
      setFonts(sortFonts(mockFonts));
      setSource("fallback");
      setError("当前浏览器不支持本机字体访问，正在显示模拟数据");
      setLoading(false);
      return;
    }
    try {
      const localFonts = await window.queryLocalFonts!();
      const unique = Array.from(new Map(localFonts.map((font) => [`${font.postscriptName}-${font.style}`, font])).values());
      unique.forEach((font) => {
        try { document.fonts.add(new FontFace(font.family, `local("${font.postscriptName.replaceAll('"', '\\"')}")`)); } catch { /* Font still remains searchable. */ }
      });
      setFonts(sortFonts(unique));
      setSource("local");
    } catch {
      setFonts(sortFonts(mockFonts));
      setSource("fallback");
      setError("未获得字体权限，正在显示模拟数据");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadFonts(); }, [loadFonts]);
  return useMemo(() => ({ fonts, source, loading, error, reload: loadFonts }), [fonts, source, loading, error, loadFonts]);
}
