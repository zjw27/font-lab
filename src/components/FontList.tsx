"use client";

import { useEffect, useRef, useState } from "react";
import type { FontInfo, PreviewSettings } from "../types";
import { getFontKey } from "../hooks/useFontLibrary";
import { FontCard } from "./FontCard";

interface FontListProps {
  fonts: FontInfo[];
  text: string;
  settings: PreviewSettings;
  frequent: string[];
  favorites: string[];
  onToggleFrequent: (key: string) => void;
  onToggleFavorite: (key: string) => void;
  onUse: (key: string) => void;
}

const INITIAL_COUNT = 24;
const LOAD_COUNT = 24;

export function FontList({ fonts, text, settings, frequent, favorites, onToggleFrequent, onToggleFavorite, onUse }: FontListProps) {
  const [renderCount, setRenderCount] = useState(INITIAL_COUNT);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 搜索结果或排版方向改变时退回首批，避免一次重排已经加载的数百张卡片。
  useEffect(() => { setRenderCount(INITIAL_COUNT); }, [fonts, settings.vertical]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || renderCount >= fonts.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setRenderCount((current) => Math.min(current + LOAD_COUNT, fonts.length));
      }
    }, { rootMargin: "700px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fonts.length, renderCount]);

  if (!fonts.length) return <div className="empty">没有找到匹配的字体</div>;

  const renderedFonts = fonts.slice(0, renderCount);
  return <>
    <div className={`font-list ${settings.vertical ? "vertical-grid" : ""}`}>
      {renderedFonts.map((font) => {
        const key = getFontKey(font);
        return <FontCard key={key} font={font} text={text} settings={settings} isFrequent={frequent.includes(key)} isFavorite={favorites.includes(key)} onToggleFrequent={() => onToggleFrequent(key)} onToggleFavorite={() => onToggleFavorite(key)} onUse={() => onUse(key)} />;
      })}
    </div>
    {renderCount < fonts.length && <div ref={loadMoreRef} className="load-more-status" aria-live="polite">
      已显示 {renderedFonts.length} / {fonts.length} · 向下滚动继续加载
    </div>}
  </>;
}
