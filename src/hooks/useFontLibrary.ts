"use client";

import { useEffect, useState } from "react";

interface StoredLibrary {
  frequent: string[];
  favorites: string[];
  recent: string[];
}

const STORAGE_KEY = "font-lab-library-v1";
const EMPTY: StoredLibrary = { frequent: [], favorites: [], recent: [] };
const MAX_RECENT = 30;

export const getFontKey = (font: { postscriptName: string; style: string }) => `${font.postscriptName}::${font.style}`;

export function useFontLibrary() {
  const [library, setLibrary] = useState<StoredLibrary>(EMPTY);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value) setLibrary({ ...EMPTY, ...JSON.parse(value) });
    } catch { /* Local storage can be unavailable in private browsing. */ }
  }, []);

  const update = (recipe: (current: StoredLibrary) => StoredLibrary) => {
    setLibrary((current) => {
      const next = recipe(current);
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep session state working. */ }
      return next;
    });
  };

  const toggleFrequent = (key: string) => update((current) => ({ ...current, frequent: toggle(current.frequent, key) }));
  const toggleFavorite = (key: string) => update((current) => ({ ...current, favorites: toggle(current.favorites, key) }));
  const markRecent = (key: string) => update((current) => ({ ...current, recent: [key, ...current.recent.filter((item) => item !== key)].slice(0, MAX_RECENT) }));

  return { library, toggleFrequent, toggleFavorite, markRecent };
}

function toggle(items: string[], key: string) {
  return items.includes(key) ? items.filter((item) => item !== key) : [...items, key];
}
