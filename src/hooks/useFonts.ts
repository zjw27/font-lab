"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FontInfo, FontSource, LocalFontData } from "../types";
import { mockFonts } from "../utils/mockFonts";
import { parseLocalizedFontNames } from "../utils/openTypeNames";
import { readFontCache, writeFontCache } from "../utils/fontCache";

declare global {
  interface Window { queryLocalFonts?: () => Promise<LocalFontData[]>; }
}

const sortFonts = (fonts: FontInfo[]) => [...fonts].sort((a, b) => a.fullName.localeCompare(b.fullName));

function normalizeFont(font: LocalFontData, names?: { displayName?: string; style?: string; glyphRanges?: Array<[number, number]> }): FontInfo {
  const postscriptName = typeof font.postscriptName === "string" ? font.postscriptName.trim() : "";
  const family = typeof font.family === "string" ? font.family.trim() : "";
  const originalFullName = typeof font.fullName === "string" ? font.fullName.trim() : "";
  const originalStyle = typeof font.style === "string" ? font.style.trim() : "";
  return {
    family: family || originalFullName || postscriptName || "sans-serif",
    fullName: names?.displayName || originalFullName || family || postscriptName || "未命名字体",
    postscriptName: postscriptName || originalFullName || family || "unknown-font",
    style: names?.style || originalStyle || "Regular",
    glyphRanges: names?.glyphRanges,
  };
}

async function addLocalizedNames(font: LocalFontData): Promise<FontInfo> {
  try {
    const names = parseLocalizedFontNames(await (await font.blob()).arrayBuffer(), font.postscriptName);
    return normalizeFont(font, names);
  } catch {
    return normalizeFont(font);
  }
}

async function localizeFonts(fonts: LocalFontData[], concurrency = 6) {
  const result = new Array<FontInfo>(fonts.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < fonts.length) {
      const index = nextIndex++;
      result[index] = await addLocalizedNames(fonts[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, fonts.length) }, worker));
  return result;
}

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
      const unique = Array.from(new Map(localFonts.map((font, index) => [`${font.postscriptName ?? font.fullName ?? index}-${font.style ?? ""}`, font])).values());
      unique.forEach((font) => {
        try {
          if (font.family && font.postscriptName) document.fonts.add(new FontFace(font.family, `local("${font.postscriptName.replaceAll('"', '\\"')}")`));
        } catch { /* Font still remains searchable. */ }
      });
      const localized = await localizeFonts(unique);
      const sortedFonts = sortFonts(localized);
      setFonts(sortedFonts);
      setSource("local");
      void writeFontCache(sortedFonts).catch(() => { /* Cache failure must not hide scanned fonts. */ });
    } catch {
      setFonts(sortFonts(mockFonts));
      setSource("fallback");
      setError("未获得字体权限，正在显示模拟数据");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void readFontCache().then((cachedFonts) => {
      if (!active) return;
      if (cachedFonts?.length) {
        setFonts(cachedFonts);
        setSource("local");
        setLoading(false);
      } else {
        void loadFonts();
      }
    }).catch(() => { if (active) void loadFonts(); });
    return () => { active = false; };
  }, [loadFonts]);
  return useMemo(() => ({ fonts, source, loading, error, reload: loadFonts }), [fonts, source, loading, error, loadFonts]);
}
