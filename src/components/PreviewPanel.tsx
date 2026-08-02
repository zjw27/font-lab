interface PreviewPanelProps { value: string; onChange: (value: string) => void; }

export function PreviewPanel({ value, onChange }: PreviewPanelProps) {
  return <section className="preview-panel">
    <label className="preview-label" htmlFor="preview-text">预览文字</label>
    <textarea id="preview-text" className="preview-input" rows={2} value={value} onChange={(event) => onChange(event.target.value)} placeholder="输入要预览的文字…" />
  </section>;
}
