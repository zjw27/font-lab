import type { PreviewSettings } from "../types";

interface SettingsPanelProps { settings: PreviewSettings; onChange: <K extends keyof PreviewSettings>(key: K, value: PreviewSettings[K]) => void; }

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return <aside className="settings-panel">
    <h2>预览设置</h2>
    <RangeSetting id="font-size" label="字号" min={12} max={96} step={1} value={settings.fontSize} suffix="px" onChange={(value) => onChange("fontSize", value)} />
    <div className="setting-row">
      <label className="field-label" htmlFor="font-weight">字重</label>
      <select id="font-weight" className="select-input" value={settings.fontWeight} onChange={(e) => onChange("fontWeight", Number(e.target.value))}>
        <option value="100">100 · Thin</option><option value="200">200 · Extra Light</option><option value="300">300 · Light</option>
        <option value="400">400 · Regular</option><option value="500">500 · Medium</option><option value="600">600 · Semi Bold</option>
        <option value="700">700 · Bold</option><option value="800">800 · Extra Bold</option><option value="900">900 · Black</option>
      </select>
    </div>
    <RangeSetting id="letter-spacing" label="字距" min={-5} max={20} step={0.5} value={settings.letterSpacing} suffix="px" onChange={(value) => onChange("letterSpacing", value)} />
    <RangeSetting id="line-height" label="行距" min={0.8} max={3} step={0.05} value={settings.lineHeight} suffix="×" onChange={(value) => onChange("lineHeight", value)} />
    <div className="setting-row">
      <span className="field-label">排版方向</span>
      <div className="segmented" role="group" aria-label="排版方向">
        <button className={!settings.vertical ? "active" : ""} onClick={() => onChange("vertical", false)} aria-pressed={!settings.vertical}>横排</button>
        <button className={settings.vertical ? "active" : ""} onClick={() => onChange("vertical", true)} aria-pressed={settings.vertical}>竖排</button>
      </div>
    </div>
    <ColorSetting id="text-color" label="颜色" value={settings.color} onChange={(value) => onChange("color", value)} />
    <ColorSetting id="background-color" label="背景色" value={settings.backgroundColor} onChange={(value) => onChange("backgroundColor", value)} />
    <p className="helper">设置会实时应用到全部字体卡片。</p>
  </aside>;
}

function RangeSetting({ id, label, min, max, step, value, suffix, onChange }: { id: string; label: string; min: number; max: number; step: number; value: number; suffix: string; onChange: (value: number) => void }) {
  const decimals = step < 0.1 ? 2 : step < 1 ? 1 : 0;
  const update = (value: number) => onChange(Math.min(max, Math.max(min, Number(value.toFixed(decimals)))));
  return <div className="setting-row">
    <label className="field-label" htmlFor={id}>{label}</label>
    <div className="range-control">
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => update(Number(e.target.value))} />
      <label className="value-input"><input type="number" min={min} max={max} step={step} value={value} onChange={(e) => update(Number(e.target.value))} aria-label={`${label}数值`} /><span>{suffix}</span></label>
    </div>
  </div>;
}

function ColorSetting({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return <div className="setting-row">
    <label className="field-label" htmlFor={id}>{label}</label>
    <div className="color-control"><input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} /><code>{value}</code></div>
  </div>;
}
