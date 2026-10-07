import { ChordLyricsPair, ChordsOverWordsParser, type Line, type Song } from "chordsheetjs";

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

// ubah satu baris jadi teks chord dan teks lirik yang lurus (untuk font monospace di PDF)
export function lineToRows(line: Line) {
  let chords = "";
  let lyrics = "";

  for (const item of line.items) {
    if (!(item instanceof ChordLyricsPair)) continue;
    const chord = item.chords.trim();
    const lyric = item.lyrics ?? "";
    const width = Math.max(chord ? chord.length + 1 : 0, lyric.length);
    chords += chord.padEnd(width);
    lyrics += lyric.padEnd(width);
  }

  return { chords: chords.trimEnd() || null, lyrics: lyrics.trimEnd() || null };
}
