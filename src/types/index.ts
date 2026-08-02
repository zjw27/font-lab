export interface FontInfo {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  glyphRanges?: Array<[number, number]>;
}

export interface PreviewSettings {
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  color: string;
  backgroundColor: string;
  vertical: boolean;
}

export type FontSource = "local" | "fallback";
export type FontCollectionFilter = "all" | "frequent" | "favorites" | "recent" | "sets";

export interface FontSet {
  id: string;
  name: string;
  color?: string;
  note?: string;
  fontKeys: string[];
}

export interface LocalFontData {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  blob: () => Promise<Blob>;
}
