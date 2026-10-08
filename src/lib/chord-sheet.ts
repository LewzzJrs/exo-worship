import { ChordLyricsPair, ChordProParser, ChordsOverWordsParser } from "chordsheetjs";
import type { ChordPart } from "@/lib/chord-numbers";

// format isi lagu: chord di atas lirik, ditulis dengan spasi supaya posisinya pas.
// satu baris lagu bisa terdiri dari (urut dari atas):
//   baris chord   G . . . | C/E        D        (boleh pakai . / | untuk ketukan dan birama)
//   baris not     1 . 2 3 | 5 . . .             (not angka melodi, tidak ikut di-transpose)
//   baris lirik   Kumilik-Mu selamanya

export type SheetSegment = {
  // chord (sudah di-transpose) atau tanda seperti | / . yang dimulai di kolom ini
  chord: string;
  // potongan not angka di kolom ini, satu untuk setiap baris not (misalnya suara 1 dan suara 2)
  melody: string[];
  lyrics: string;
  // lebar kolom aslinya seperti yang diketik admin
  width: number;
};

export type SheetLine = {
  segments: SheetSegment[];
  hasChords: boolean;
  hasMelody: boolean;
  hasLyrics: boolean;
};

export type SongSection = {
  label: string | null;
  lines: SheetLine[];
};

const LABEL_LINE = /^\s*\[([^\]]+)\]\s*$/;
// tanda di baris chord: garis birama, ketukan (/ atau .), ulangan, N.C.
const CHORD_LINE_SYMBOL = /^(?:[|:]+|\/+|\.+|-+|%|N\.?C\.?|\(?(?:x\d+|\d+x)\)?)$/i;
// not angka: 0-7 (boleh # b dan tanda oktaf ' ,), titik ketukan, garis birama
const MELODY_LINE = /^[0-7#b'’,.|:()\s-]+$/;

// dicek dengan aturan chord ChordSheetJS yang ketat (Chord.parse terlalu longgar: "Gunung" dianggap chord)
const chordCache = new Map<string, boolean>();
function isChord(text: string) {
  if (!/^[A-G]/.test(text)) return false;
  let result = chordCache.get(text);
  if (result === undefined) {
    const pairs = new ChordsOverWordsParser()
      .parse(text)
      .lines.flatMap((line) => line.items.filter((item) => item instanceof ChordLyricsPair));
    result = pairs.length > 0 && pairs.every((pair) => pair.chords && !pair.lyrics?.trim());
    chordCache.set(text, result);
  }
  return result;
}

type ChordToken = { open: string; core: string; close: string; dots: string };

// chord boleh diberi kurung dan titik ketukan di belakangnya, misalnya (G) atau C....
function chordCore(token: string): ChordToken | null {
  const [, body, dots] = token.match(/^(.*?)(\.*)$/) ?? ["", token, ""];
  if (isChord(body)) return { open: "", core: body, close: "", dots };
  const wrapped = body.match(/^\((.+)\)$/);
  if (wrapped && isChord(wrapped[1])) return { open: "(", core: wrapped[1], close: ")", dots };
  return null;
}

function isChordLine(row: string) {
  const tokens = row.trim().split(/\s+/);
  return (
    tokens.some((token) => chordCore(token)) &&
    tokens.every((token) => CHORD_LINE_SYMBOL.test(token) || chordCore(token))
  );
}

function isMelodyLine(row: string) {
  return MELODY_LINE.test(row) && /[0-7]/.test(row) && !isChordLine(row);
}

function isLyricLine(row: string) {
  return row.trim() !== "" && !isChordLine(row) && !isMelodyLine(row) && !LABEL_LINE.test(row);
}

// pisahkan isi lagu per bagian berdasarkan baris label seperti [Verse 1] atau [Chorus]
function splitSections(content: string) {
  const sections: { label: string | null; lines: string[] }[] = [];
  let current: { label: string | null; lines: string[] } = { label: null, lines: [] };

  const pushCurrent = () => {
    if (current.label || current.lines.some((line) => line.trim())) sections.push(current);
  };

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(LABEL_LINE);
    if (match) {
      pushCurrent();
      current = { label: match[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  pushCurrent();
  return sections;
}

// transpose beberapa chord sekaligus lewat ChordSheetJS, supaya penulisannya sesuai key tujuan
// (misalnya Bb, bukan A#, di key F). Kalau key tidak terbaca, chord dibiarkan apa adanya
function transposeChords(chords: string[], fromKey: string, toKey: string) {
  if (chords.length === 0) return chords;
  try {
    const song = new ChordProParser()
      .parse(chords.map((chord) => `[${chord}]`).join(" "))
      .setKey(fromKey)
      .changeKey(toKey);
    const result = song.lines.flatMap((line) =>
      line.items
        .filter((item) => item instanceof ChordLyricsPair && item.chords)
        .map((item) => (item as ChordLyricsPair).chords),
    );
    return result.length === chords.length ? result : chords;
  } catch {
    return chords;
  }
}

function tokensWithColumns(row: string) {
  return [...row.matchAll(/\S+/g)].map((match) => ({ text: match[0], start: match.index }));
}

// potong baris per kolom: setiap chord atau not memulai potongan baru, lirik di bawahnya ikut terpotong
function buildLine(
  chordRow: string | null,
  melodyRows: string[],
  lyricRow: string | null,
  fromKey: string,
  toKey: string,
): SheetLine {
  const chordTokens = chordRow ? tokensWithColumns(chordRow) : [];
  const melodyTokens = melodyRows.flatMap(tokensWithColumns);

  // hanya inti chordnya yang di-transpose, kurung dan titik ketukan tetap
  const cores = chordTokens.map((token) => chordCore(token.text));
  const transposed = transposeChords(
    cores.filter((core) => core !== null).map((core) => core.core),
    fromKey,
    toKey,
  );
  let next = 0;
  const chordTexts = chordTokens.map((token, index) => {
    const core = cores[index];
    if (!core) return token.text;
    const { open, close, dots } = core;
    return `${open}${transposed[next++]}${close}${dots}`;
  });

  const starts = [
    ...new Set([
      0,
      ...chordTokens.map((token) => token.start),
      ...melodyTokens.map((t) => t.start),
    ]),
  ].sort((a, b) => a - b);
  const rowLength = Math.max(
    chordRow?.trimEnd().length ?? 0,
    ...melodyRows.map((row) => row.trimEnd().length),
    lyricRow?.trimEnd().length ?? 0,
  );

  const segments = starts.map((start, index) => {
    const end = starts[index + 1] ?? Math.max(rowLength, start + 1);
    const chordIndex = chordTokens.findIndex((token) => token.start === start);
    return {
      chord: chordIndex >= 0 ? chordTexts[chordIndex] : "",
      melody: melodyRows.map((row) => row.slice(start, end).trimEnd()),
      lyrics: lyricRow?.slice(start, end) ?? "",
      width: end - start,
    };
  });

  return {
    segments,
    hasChords: chordTokens.length > 0,
    hasMelody: melodyTokens.length > 0,
    hasLyrics: Boolean(lyricRow?.trim()),
  };
}

// kelompokkan baris chord, baris not, dan baris lirik yang berurutan jadi satu baris lagu
function parseLines(rows: string[], fromKey: string, toKey: string) {
  const lines: SheetLine[] = [];
  let index = 0;

  while (index < rows.length) {
    if (!rows[index].trim()) {
      index++;
      continue;
    }
    let chordRow: string | null = null;
    const melodyRows: string[] = [];
    let lyricRow: string | null = null;

    if (isChordLine(rows[index])) chordRow = rows[index++];
    // beberapa baris not berurutan (misalnya suara 1 dan 2) tetap satu kelompok
    while (index < rows.length && isMelodyLine(rows[index])) melodyRows.push(rows[index++]);
    if (index < rows.length && isLyricLine(rows[index])) lyricRow = rows[index++];

    lines.push(buildLine(chordRow, melodyRows, lyricRow, fromKey, toKey));
  }
  return lines;
}

// isi lagu per bagian, dengan chord sudah di-transpose dari key asli ke key tujuan
export function parseSections(content: string, originalKey: string, targetKey: string) {
  return splitSections(content).map(({ label, lines }): SongSection => ({
    label,
    lines: parseLines(lines, originalKey, targetKey),
  }));
}

type ChordFormatter = (chord: string) => ChordPart[];

const plainChord: ChordFormatter = (chord) => [{ text: chord }];

// ubah satu baris jadi teks chord, not, dan lirik yang lurus (untuk font monospace).
// posisi kolom dijaga persis seperti yang diketik; baru digeser kalau chord hasil transpose
// lebih panjang dan menabrak chord berikutnya.
// chordParts sama dengan chords, tapi tetap terpotong per bagian (untuk angka kecil di atas)
export function lineToRows(line: SheetLine, formatChord: ChordFormatter = plainChord) {
  const chordParts: ChordPart[] = [];
  let chordLength = 0;
  const melodyCount = Math.max(0, ...line.segments.map((segment) => segment.melody.length));
  let melody: string[] = Array.from({ length: melodyCount }, () => "");
  let lyrics = "";

  for (const segment of line.segments) {
    if (segment.chord) {
      // minimal satu spasi setelah chord sebelumnya; kalau kurang, semua baris digeser
      const minColumn = chordLength > 0 ? chordLength + 1 : 0;
      if (lyrics.length < minColumn) {
        melody = melody.map((row) => row.padEnd(minColumn));
        lyrics = lyrics.padEnd(minColumn);
      }
      const parts = formatChord(segment.chord);
      chordParts.push({ text: " ".repeat(lyrics.length - chordLength) }, ...parts);
      chordLength = lyrics.length + parts.reduce((total, part) => total + part.text.length, 0);
    }
    melody = melody.map((row, index) => row + (segment.melody[index] ?? "").padEnd(segment.width));
    lyrics += segment.lyrics.padEnd(segment.width);
  }

  const chords = chordParts.map((part) => part.text).join("");
  return {
    chords: line.hasChords && chords ? chords : null,
    chordParts,
    melody: line.hasMelody ? melody.map((row) => row.trimEnd()) : [],
    lyrics: line.hasLyrics ? lyrics.trimEnd() || null : null,
  };
}

// tulis ulang isi lagu di key lain, misalnya untuk titik awal aransemen
export function transposeContent(content: string, fromKey: string, toKey: string) {
  if (fromKey === toKey) return content;

  return parseSections(content, fromKey, toKey)
    .map((section) => {
      const lines = section.lines.flatMap((line) => {
        const rows = lineToRows(line);
        return [rows.chords, ...rows.melody, rows.lyrics].filter((row) => row !== null);
      });
      return [section.label ? `[${section.label}]` : null, ...lines]
        .filter((line) => line !== null)
        .join("\n");
    })
    .join("\n\n");
}
