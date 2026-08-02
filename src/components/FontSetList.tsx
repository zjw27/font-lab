"use client";

import { useState } from "react";
import type { FontSet } from "../types";

interface FontSetListProps {
  sets: FontSet[];
  onOpen: (id: string) => void;
  onCreate: (name: string, options?: { color?: string; note?: string }) => void;
  onDelete: (id: string) => void;
}

export function FontSetList({ sets, onOpen, onCreate, onDelete }: FontSetListProps) {
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FontSet>();
  return <section className="font-set-browser">
    <div className="font-set-browser-header">
      <div><h2>我的字体集</h2><p>把适合相同场景的字体收在一起。</p></div>
      <button className="primary-light-button" onClick={() => setCreating(true)}>＋ 新建字体集</button>
    </div>
    {sets.length ? <div className="font-set-list">{sets.map((fontSet) => <div className="font-set-row" key={fontSet.id}>
      <button className="font-set-open" onClick={() => onOpen(fontSet.id)}>
        <span className="font-set-color" style={{ backgroundColor: fontSet.color ?? "#d8d7d1" }} />
        <span><strong>{fontSet.name}</strong>{fontSet.note && <small>{fontSet.note}</small>}</span>
        <b>{fontSet.fontKeys.length} 款</b>
      </button>
      <button className="font-set-delete" title={`删除“${fontSet.name}”`} onClick={() => setDeleteTarget(fontSet)}>删除</button>
    </div>)}</div> : <div className="empty">还没有字体集。新建一个，然后从字体卡片加入字体。</div>}
    {creating && <CreateFontSetDialog onClose={() => setCreating(false)} onCreate={(name, options) => { onCreate(name, options); setCreating(false); }} />}
    {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(undefined)}>
      <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-set-title" onMouseDown={(event) => event.stopPropagation()}>
        <h3 id="delete-set-title">删除字体集？</h3>
        <p>“{deleteTarget.name}”会被删除，字体文件本身不会受到影响。</p>
        <div className="dialog-actions"><button onClick={() => setDeleteTarget(undefined)}>取消</button><button className="danger-button" onClick={() => { onDelete(deleteTarget.id); setDeleteTarget(undefined); }}>删除</button></div>
      </div>
    </div>}
  </section>;
}

function CreateFontSetDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, options?: { color?: string; note?: string }) => void }) {
  const [name, setName] = useState("");
  const [colorEnabled, setColorEnabled] = useState(false);
  const [color, setColor] = useState("#d59a58");
  const [note, setNote] = useState("");
  const submit = () => { if (name.trim()) onCreate(name.trim(), { color: colorEnabled ? color : undefined, note }); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <div className="create-set-dialog" role="dialog" aria-modal="true" aria-labelledby="create-set-title" onMouseDown={(event) => event.stopPropagation()}>
      <h3 id="create-set-title">新建字体集</h3>
      <label><span>名称</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="例如：气泡正文" /></label>
      <label className="optional-color"><input type="checkbox" checked={colorEnabled} onChange={(event) => setColorEnabled(event.target.checked)} /><span>颜色</span>{colorEnabled && <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />}</label>
      <label><span>备注 <small>可选</small></span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="适用场景或筛选想法" /></label>
      <div className="dialog-actions"><button onClick={onClose}>取消</button><button disabled={!name.trim()} onClick={submit}>创建</button></div>
    </div>
  </div>;
}
