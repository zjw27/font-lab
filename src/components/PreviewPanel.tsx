interface PreviewPanelProps { value: string; onChange: (value: string) => void; }

export function PreviewPanel({ value, onChange }: PreviewPanelProps) {
  return <section className="preview-panel">
    <label className="preview-label" htmlFor="preview-text">预览文字</label>
    <input id="preview-text" className="preview-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="输入要预览的文字…" autoComplete="off" />
  </section>;
}
