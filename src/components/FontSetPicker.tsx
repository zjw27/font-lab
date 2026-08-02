"use client";

import { useEffect, useRef, useState } from "react";
import type { FontSet } from "../types";

export function FontSetPicker({ sets, fontKey, onToggle, onCreate, onClose }: { sets: FontSet[]; fontKey: string; onToggle: (setId: string, key: string) => void; onCreate: (name: string) => FontSet; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [newName, setNewName] = useState("");
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!panelRef.current?.contains(event.target as Node)) onClose(); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [onClose]);
  const create = () => {
    if (!newName.trim()) return;
    const fontSet = onCreate(newName.trim());
    onToggle(fontSet.id, fontKey);
    setNewName("");
  };
  return <div className="font-set-picker" ref={panelRef} role="dialog" aria-label="加入字体集">
    <strong>加入字体集</strong>
    <div className="font-set-options">{sets.length ? sets.map((fontSet) => {
      const checked = fontSet.fontKeys.includes(fontKey);
      return <label key={fontSet.id}><input type="checkbox" checked={checked} onChange={() => onToggle(fontSet.id, fontKey)} /><span>{fontSet.name}</span></label>;
    }) : <p>还没有字体集</p>}</div>
    <div className="quick-create-set"><span>＋</span><input value={newName} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") create(); }} placeholder="新建字体集，回车完成" /></div>
  </div>;
}
