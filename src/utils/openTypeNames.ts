const CHINESE_WINDOWS_LANGUAGES = [0x0804, 0x1004, 0x1404, 0x0404, 0x0c04];
const CHINESE_MAC_LANGUAGES = [33, 19];
const DISPLAY_NAME_IDS = [4, 16, 1];

interface NameRecord {
  nameId: number;
  languageId: number;
  platformId: number;
  encodingId: number;
  value: string;
}

export interface LocalizedFontNames {
  displayName?: string;
  family?: string;
  style?: string;
  postscriptName?: string;
  glyphRanges?: Array<[number, number]>;
}

const readTag = (view: DataView, offset: number) =>
  String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));

function decodeUtf16Be(bytes: Uint8Array) {
  let result = "";
  for (let index = 0; index + 1 < bytes.length; index += 2) {
    result += String.fromCharCode((bytes[index] << 8) | bytes[index + 1]);
  }
  return result;
}

function decodeName(bytes: Uint8Array, platformId: number, encodingId: number) {
  try {
    if (platformId === 0 || platformId === 3) return decodeUtf16Be(bytes);
    if (platformId === 1 && encodingId === 25) return new TextDecoder("gb18030").decode(bytes);
    if (platformId === 1 && encodingId === 2) return new TextDecoder("big5").decode(bytes);
    return new TextDecoder("macintosh").decode(bytes);
  } catch {
    return new TextDecoder().decode(bytes);
  }
}

function faceOffsets(view: DataView) {
  if (view.byteLength < 12 || readTag(view, 0) !== "ttcf") return [0];
  const count = view.getUint32(8);
  const offsets: number[] = [];
  for (let index = 0; index < count && 12 + index * 4 + 4 <= view.byteLength; index += 1) {
    offsets.push(view.getUint32(12 + index * 4));
  }
  return offsets;
}

function readNameRecords(view: DataView, faceOffset: number): NameRecord[] {
  if (faceOffset + 12 > view.byteLength) return [];
  const tableCount = view.getUint16(faceOffset + 4);
  let nameOffset = -1;
  let nameLength = 0;
  for (let index = 0; index < tableCount; index += 1) {
    const entry = faceOffset + 12 + index * 16;
    if (entry + 16 > view.byteLength) break;
    if (readTag(view, entry) === "name") {
      nameOffset = view.getUint32(entry + 8);
      nameLength = view.getUint32(entry + 12);
      break;
    }
  }
  if (nameOffset < 0 || nameOffset + 6 > view.byteLength) return [];
  const count = view.getUint16(nameOffset + 2);
  const stringsOffset = nameOffset + view.getUint16(nameOffset + 4);
  const tableEnd = Math.min(nameOffset + nameLength, view.byteLength);
  const records: NameRecord[] = [];
  for (let index = 0; index < count; index += 1) {
    const offset = nameOffset + 6 + index * 12;
    if (offset + 12 > tableEnd) break;
    const platformId = view.getUint16(offset);
    const encodingId = view.getUint16(offset + 2);
    const languageId = view.getUint16(offset + 4);
    const nameId = view.getUint16(offset + 6);
    const length = view.getUint16(offset + 8);
    const start = stringsOffset + view.getUint16(offset + 10);
    if (start < stringsOffset || start + length > tableEnd) continue;
    const value = decodeName(new Uint8Array(view.buffer, view.byteOffset + start, length), platformId, encodingId).replaceAll("\u0000", "").trim();
    if (value) records.push({ platformId, encodingId, languageId, nameId, value });
  }
  return records;
}

function findTable(view: DataView, faceOffset: number, tag: string) {
  if (faceOffset + 12 > view.byteLength) return;
  const count = view.getUint16(faceOffset + 4);
  for (let index = 0; index < count; index += 1) {
    const entry = faceOffset + 12 + index * 16;
    if (entry + 16 > view.byteLength) return;
    if (readTag(view, entry) === tag) return { offset: view.getUint32(entry + 8), length: view.getUint32(entry + 12) };
  }
}

function readGlyphRanges(view: DataView, faceOffset: number): Array<[number, number]> | undefined {
  const table = findTable(view, faceOffset, "cmap");
  if (!table || table.offset + 4 > view.byteLength) return;
  const count = view.getUint16(table.offset + 2);
  let format12 = -1;
  let format4 = -1;
  for (let index = 0; index < count; index += 1) {
    const record = table.offset + 4 + index * 8;
    if (record + 8 > view.byteLength) break;
    const subtable = table.offset + view.getUint32(record + 4);
    if (subtable + 2 > view.byteLength) continue;
    const format = view.getUint16(subtable);
    if (format === 12) format12 = subtable;
    else if (format === 4) format4 = subtable;
  }
  if (format12 >= 0 && format12 + 16 <= view.byteLength) {
    const groups = view.getUint32(format12 + 12);
    const ranges: Array<[number, number]> = [];
    for (let index = 0; index < groups; index += 1) {
      const group = format12 + 16 + index * 12;
      if (group + 12 > view.byteLength) break;
      ranges.push([view.getUint32(group), view.getUint32(group + 4)]);
    }
    return ranges;
  }
  if (format4 >= 0 && format4 + 14 <= view.byteLength) {
    const segmentCount = view.getUint16(format4 + 6) / 2;
    const ends = format4 + 14;
    const starts = ends + segmentCount * 2 + 2;
    const ranges: Array<[number, number]> = [];
    for (let index = 0; index < segmentCount; index += 1) {
      const start = view.getUint16(starts + index * 2);
      const end = view.getUint16(ends + index * 2);
      if (start <= end && start !== 0xffff) ranges.push([start, end]);
    }
    return ranges;
  }
}

function isChinese(record: NameRecord) {
  return (record.platformId === 3 && CHINESE_WINDOWS_LANGUAGES.includes(record.languageId)) ||
    (record.platformId === 1 && CHINESE_MAC_LANGUAGES.includes(record.languageId));
}

function pick(records: NameRecord[], nameIds: number[], chineseOnly = false) {
  for (const nameId of nameIds) {
    for (const languageId of CHINESE_WINDOWS_LANGUAGES) {
      const match = records.find((record) => record.nameId === nameId && record.platformId === 3 && record.languageId === languageId);
      if (match) return match.value;
    }
    const macMatch = records.find((record) => record.nameId === nameId && record.platformId === 1 && CHINESE_MAC_LANGUAGES.includes(record.languageId));
    if (macMatch) return macMatch.value;
    if (!chineseOnly) {
      const match = records.find((record) => record.nameId === nameId && !isChinese(record));
      if (match) return match.value;
    }
  }
}

export function parseLocalizedFontNames(buffer: ArrayBuffer, expectedPostscriptName?: string): LocalizedFontNames {
  const view = new DataView(buffer);
  const faces = faceOffsets(view).map((offset) => ({ offset, records: readNameRecords(view, offset) })).filter((face) => face.records.length);
  const face = faces.find((candidate) => candidate.records.some((record) => record.nameId === 6 && record.value === expectedPostscriptName)) ?? faces[0];
  const records = face?.records ?? [];
  return {
    displayName: pick(records, DISPLAY_NAME_IDS, true),
    family: pick(records, [16, 1], true),
    style: pick(records, [17, 2], true),
    postscriptName: pick(records, [6]),
    glyphRanges: face ? readGlyphRanges(view, face.offset) : undefined,
  };
}
