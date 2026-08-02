"use client";

import { useEffect, useState } from "react";
import type { FontInfo, PreviewSettings } from "../types";

interface FontCardProps {
  font: FontInfo;
  text: string;
  settings: PreviewSettings;
  isFrequent: boolean;
  isFavorite: boolean;
  onToggleFrequent: () => void;
  onToggleFavorite: () => void;
  onUse: () => void;
}

export function FontCard({ font, text, settings, isFrequent, isFavorite, onToggleFrequent, onToggleFavorite, onUse }: FontCardProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyFontName = async () => {
    try {
      await navigator.clipboard.writeText(font.fullName);
      setCopied(true);
    } catch {
      const input = document.createElement("textarea");
      input.value = font.fullName;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      setCopied(true);
    }
    onUse();
  };

  return <article className="font-card">
    <header className="font-card-header">
      <span className="font-name">{font.fullName}</span>
      <span>{font.style}</span>
    </header>
    <p className={`font-preview ${settings.vertical ? "vertical" : ""}`} style={{
      fontFamily: `"${font.family}", "${font.fullName}", sans-serif`,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      letterSpacing: `${settings.letterSpacing}px`,
      lineHeight: settings.lineHeight,
      color: settings.color,
      backgroundColor: settings.backgroundColor,
    }}>
      {text || "输入文字开始预览"}
    </p>
    <footer className="font-card-actions">
      <button className={isFrequent ? "active" : ""} onClick={onToggleFrequent} aria-pressed={isFrequent} title={isFrequent ? "移出常用字体" : "加入常用字体"}>★ <span>常用</span></button>
      <button className={isFavorite ? "active favorite" : ""} onClick={onToggleFavorite} aria-pressed={isFavorite} title={isFavorite ? "取消收藏" : "收藏字体"}>♥ <span>收藏</span></button>
      <button className={copied ? "copied" : ""} onClick={() => void copyFontName()} title="复制字体名称">▣ <span>{copied ? "已复制" : "复制字体名"}</span></button>
    </footer>
  </article>;
}
