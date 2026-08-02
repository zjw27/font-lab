"use client";

import { useEffect, useState } from "react";
import type { FontSet } from "../types";

interface StoredLibrary {
  frequent: string[];
  favorites: string[];
  recent: string[];
  sets: FontSet[];
}

const STORAGE_KEY = "font-lab-library-v1";
const EMPTY: StoredLibrary = { frequent: [], favorites: [], recent: [], sets: [] };
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
  const createSet = (name: string, options?: { color?: string; note?: string }) => {
    const fontSet: FontSet = {
      id: globalThis.crypto?.randomUUID?.() ?? `set-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      color: options?.color,
      note: options?.note?.trim() || undefined,
      fontKeys: [],
    };
    if (fontSet.name) update((current) => ({ ...current, sets: [...current.sets, fontSet] }));
    return fontSet;
  };
  const deleteSet = (id: string) => update((current) => ({ ...current, sets: current.sets.filter((fontSet) => fontSet.id !== id) }));
  const toggleSetFont = (id: string, key: string) => update((current) => ({
    ...current,
    sets: current.sets.map((fontSet) => fontSet.id === id ? { ...fontSet, fontKeys: toggle(fontSet.fontKeys, key) } : fontSet),
  }));

  return { library, toggleFrequent, toggleFavorite, markRecent, createSet, deleteSet, toggleSetFont };
}

function toggle(items: string[], key: string) {
  return items.includes(key) ? items.filter((item) => item !== key) : [...items, key];
}
