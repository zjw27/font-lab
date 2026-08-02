interface SearchBarProps { value: string; onChange: (value: string) => void; }

export function SearchBar({ value, onChange }: SearchBarProps) {
  return <div className="search-wrap">
    <span className="search-icon" aria-hidden="true">⌕</span>
    <input className="search-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="搜索字体名称" aria-label="搜索字体" />
    {value && <button className="search-clear" type="button" onClick={() => onChange("")} aria-label="清除搜索">×</button>}
  </div>;
}
