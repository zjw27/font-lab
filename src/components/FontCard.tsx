"use client";

import { useEffect, useState } from "react";
import type { FontInfo, PreviewSettings } from "../types";
import type { FontSet } from "../types";
import { FontSetPicker } from "./FontSetPicker";

interface FontCardProps {
  font: FontInfo;
  text: string;
  settings: PreviewSettings;
  isFrequent: boolean;
  isFavorite: boolean;
  onToggleFrequent: () => void;
  onToggleFavorite: () => void;
  onUse: () => void;
  fontKey: string;
  sets: FontSet[];
  onToggleSet: (setId: string, key: string) => void;
  onCreateSet: (name: string) => FontSet;
}

export function FontCard({ font, text, settings, isFrequent, isFavorite, onToggleFrequent, onToggleFavorite, onUse, fontKey, sets, onToggleSet, onCreateSet }: FontCardProps) {
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showAllSets, setShowAllSets] = useState(false);

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

  const previewText = replaceMissingGlyphs(text || "输入文字开始预览", font.glyphRanges);
  const memberships = sets.filter((fontSet) => fontSet.fontKeys.includes(fontKey));
  const visibleMemberships = showAllSets ? memberships : memberships.slice(0, 2);

  return <article className="font-card">
    <header className="font-card-header">
      <div className="font-title-group"><span className="font-name">{font.fullName}</span>{memberships.length > 0 && <span className="font-memberships">{visibleMemberships.map((fontSet) => <span key={fontSet.id} style={{ borderColor: fontSet.color }}>{fontSet.name}</span>)}{!showAllSets && memberships.length > 2 && <button onClick={() => setShowAllSets(true)}>+{memberships.length - 2}</button>}{showAllSets && memberships.length > 2 && <button onClick={() => setShowAllSets(false)}>收起</button>}</span>}</div>
      <span>{font.style}</span>
    </header>
    <p className={`font-preview ${settings.vertical ? "vertical" : ""}`} style={{
      fontFamily: `"${font.family}"`,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      letterSpacing: `${settings.letterSpacing}px`,
      lineHeight: settings.lineHeight,
      color: settings.color,
      backgroundColor: settings.backgroundColor,
    }}>
      {previewText}
    </p>
    <footer className="font-card-actions">
      <button className={isFrequent ? "active" : ""} onClick={onToggleFrequent} aria-pressed={isFrequent} title={isFrequent ? "移出常用字体" : "加入常用字体"}>★ <span>常用</span></button>
      <button className={isFavorite ? "active favorite" : ""} onClick={onToggleFavorite} aria-pressed={isFavorite} title={isFavorite ? "取消收藏" : "收藏字体"}>♥ <span>收藏</span></button>
      <div className="font-set-action"><button className={memberships.length ? "active set-active" : ""} onClick={() => setPickerOpen((open) => !open)} aria-expanded={pickerOpen}>＋ <span>加入字体集</span></button>{pickerOpen && <FontSetPicker sets={sets} fontKey={fontKey} onToggle={onToggleSet} onCreate={onCreateSet} onClose={() => setPickerOpen(false)} />}</div>
      <button className={copied ? "copied" : ""} onClick={() => void copyFontName()} title="复制字体名称">▣ <span>{copied ? "已复制" : "复制字体名"}</span></button>
    </footer>
  </article>;
}

function replaceMissingGlyphs(text: string, ranges?: Array<[number, number]>) {
  if (!ranges?.length) return text;
  return Array.from(text, (character) => {
    const codePoint = character.codePointAt(0)!;
    if (/\s/u.test(character) || codePoint === 0x200d || (codePoint >= 0xfe00 && codePoint <= 0xfe0f) || (codePoint >= 0xe0100 && codePoint <= 0xe01ef)) return character;
    return ranges.some(([start, end]) => codePoint >= start && codePoint <= end) ? character : "□";
  }).join("");
}
