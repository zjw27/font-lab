"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FontInfo, FontSet, PreviewSettings } from "../types";
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
  sets: FontSet[];
  onToggleSet: (setId: string, key: string) => void;
  onCreateSet: (name: string) => FontSet;
}

const INITIAL_COUNT = 24;
const LOAD_COUNT = 24;

export function FontList({ fonts, text, settings, frequent, favorites, onToggleFrequent, onToggleFavorite, onUse, sets, onToggleSet, onCreateSet }: FontListProps) {
  const [renderCount, setRenderCount] = useState(INITIAL_COUNT);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pendingScrollPosition = useRef<{ x: number; y: number }>();

  const toggleWithoutScroll = (toggle: (key: string) => void, key: string) => {
    pendingScrollPosition.current = { x: window.scrollX, y: window.scrollY };
    toggle(key);
  };

  useLayoutEffect(() => {
    const position = pendingScrollPosition.current;
    if (!position) return;
    pendingScrollPosition.current = undefined;
    window.scrollTo(position.x, position.y);
  }, [frequent, favorites]);

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
        return <FontCard key={key} font={font} fontKey={key} text={text} settings={settings} isFrequent={frequent.includes(key)} isFavorite={favorites.includes(key)} sets={sets} onToggleSet={onToggleSet} onCreateSet={onCreateSet} onToggleFrequent={() => toggleWithoutScroll(onToggleFrequent, key)} onToggleFavorite={() => toggleWithoutScroll(onToggleFavorite, key)} onUse={() => onUse(key)} />;
      })}
    </div>
    {renderCount < fonts.length && <div ref={loadMoreRef} className="load-more-status" aria-live="polite">
      已显示 {renderedFonts.length} / {fonts.length} · 向下滚动继续加载
    </div>}
  </>;
}
