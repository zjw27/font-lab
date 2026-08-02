export interface FontInfo {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
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
export type FontCollectionFilter = "all" | "frequent" | "favorites" | "recent";

export interface LocalFontData {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
}
