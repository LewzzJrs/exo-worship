import { ChordLyricsPair, ChordsOverWordsParser, type Line, type Song } from "chordsheetjs";
import type { ChordPart } from "@/lib/chord-numbers";

export type SongSection = {
  label: string | null;
  song: Song;
};

const LABEL_LINE = /^\s*\[([^\]]+)\]\s*$/;

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

  return sections.map((section) => ({
    label: section.label,
    body: trimBlankLines(section.lines),
  }));
}

// buang baris kosong di awal dan akhir saja, spasi di depan baris chord tetap dijaga
function trimBlankLines(lines: string[]) {
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start++;
  while (end > start && !lines[end - 1].trim()) end--;
  return lines.slice(start, end).join("\n");
}

// parser ini mengerti garis birama (| D / / / |), jadi chord di dalamnya ikut di-transpose
export function parseSections(content: string, originalKey: string, targetKey: string) {
  return splitSections(content).map(({ label, body }): SongSection => {
    const song = new ChordsOverWordsParser().parse(body);
    try {
      // changeKey memilih penulisan chord sesuai key tujuan (misal Bb di key F)
      return { label, song: song.setKey(originalKey).changeKey(targetKey) };
    } catch {
      // key lagu tidak terbaca, tampilkan apa adanya
      return { label, song };
    }
  });
}

type ChordFormatter = (chord: string) => ChordPart[];

const plainChord: ChordFormatter = (chord) => [{ text: chord }];

// ubah satu baris jadi teks chord dan teks lirik yang lurus (untuk font monospace di PDF).
// chordParts sama dengan chords, tapi tetap terpotong per bagian (untuk angka kecil di atas)
export function lineToRows(line: Line, formatChord: ChordFormatter = plainChord) {
  const chordParts: ChordPart[] = [];
  let lyrics = "";

  for (const item of line.items) {
    if (!(item instanceof ChordLyricsPair)) continue;
    const chord = item.chords.trim();
    const parts = chord ? formatChord(chord) : [];
    const length = parts.reduce((total, part) => total + part.text.length, 0);
    const lyric = item.lyrics ?? "";
    const width = Math.max(length ? length + 1 : 0, lyric.length);
    chordParts.push(...parts, { text: " ".repeat(width - length) });
    lyrics += lyric.padEnd(width);
  }

  // spasi di ujung baris dibuang
  while (chordParts.length > 0 && !chordParts[chordParts.length - 1].text.trim()) chordParts.pop();
  const chords = chordParts.map((part) => part.text).join("");
  return {
    chords: chords || null,
    chordParts,
    lyrics: lyrics.trimEnd() || null,
  };
}

// tulis ulang isi lagu di key lain (chord di atas lirik), misalnya untuk titik awal aransemen
export function transposeContent(content: string, fromKey: string, toKey: string) {
  if (fromKey === toKey) return content;

  return parseSections(content, fromKey, toKey)
    .map((section) => {
      const lines = section.song.lines.flatMap((line) => {
        const rows = lineToRows(line);
        return [rows.chords, rows.lyrics].filter((row) => row !== null);
      });
      return [section.label ? `[${section.label}]` : null, ...lines]
        .filter((line) => line !== null)
        .join("\n");
    })
    .join("\n\n");
}
