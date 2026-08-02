"use client";

import { useMemo, useState } from "react";
import { FontList } from "../components/FontList";
import { PreviewPanel } from "../components/PreviewPanel";
import { SearchBar } from "../components/SearchBar";
import { SettingsPanel } from "../components/SettingsPanel";
import { useFonts } from "../hooks/useFonts";
import { getFontKey, useFontLibrary } from "../hooks/useFontLibrary";
import { useSettings } from "../hooks/useSettings";
import type { FontCollectionFilter } from "../types";

export default function Home() {
  const [previewText, setPreviewText] = useState("やらないとは言ってないだろ");
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<FontCollectionFilter>("all");
  const { fonts, source, loading, error, reload } = useFonts();
  const { settings, updateSetting } = useSettings();
  const { library, toggleFrequent, toggleFavorite, markRecent } = useFontLibrary();
  const visibleFonts = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    const collectionKeys = collection === "frequent" ? library.frequent : collection === "favorites" ? library.favorites : collection === "recent" ? library.recent : null;
    let result = collectionKeys ? fonts.filter((font) => collectionKeys.includes(getFontKey(font))) : fonts;
    if (collection === "recent") result = [...result].sort((a, b) => library.recent.indexOf(getFontKey(a)) - library.recent.indexOf(getFontKey(b)));
    if (!keyword) return result;
    return result.filter((font) => [font.family, font.fullName, font.postscriptName, font.style].some((value) => value.toLocaleLowerCase().includes(keyword)));
  }, [fonts, query, collection, library]);

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><h1>Font Lab</h1><span>字体实验场</span></div>
      <div className="font-status" title={error ?? undefined}>
        <span className={`status-dot ${source === "fallback" ? "fallback" : ""}`} />
        <span>{loading ? "正在读取字体…" : source === "local" ? `已读取 ${fonts.length} 款本机字体` : "模拟字体数据"}</span>
        {!loading && source === "fallback" && <button className="retry-button" onClick={() => void reload()}>读取本机字体</button>}
      </div>
    </header>
    <div className="workspace">
      <section className="content">
        <PreviewPanel value={previewText} onChange={setPreviewText} />
        <div className="collection-tabs" role="tablist" aria-label="字体分类">
          <CollectionTab label="全部字体" count={fonts.length} active={collection === "all"} onClick={() => setCollection("all")} />
          <CollectionTab label="★ 常用字体" count={library.frequent.length} active={collection === "frequent"} onClick={() => setCollection("frequent")} />
          <CollectionTab label="♥ 收藏字体" count={library.favorites.length} active={collection === "favorites"} onClick={() => setCollection("favorites")} />
          <CollectionTab label="最近使用" count={library.recent.length} active={collection === "recent"} onClick={() => setCollection("recent")} />
        </div>
        <div className="list-toolbar"><span className="list-heading">当前显示 · {visibleFonts.length}</span><SearchBar value={query} onChange={setQuery} /></div>
        <FontList fonts={visibleFonts} text={previewText} settings={settings} frequent={library.frequent} favorites={library.favorites} onToggleFrequent={toggleFrequent} onToggleFavorite={toggleFavorite} onUse={markRecent} />
      </section>
      <SettingsPanel settings={settings} onChange={updateSetting} />
    </div>
  </main>;
}

function CollectionTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return <button role="tab" aria-selected={active} className={active ? "active" : ""} onClick={onClick}>{label}<span>{count}</span></button>;
}
