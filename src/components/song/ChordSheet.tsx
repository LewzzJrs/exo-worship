"use client";

import { useMemo } from "react";
import { ChordLyricsPair, type Line } from "chordsheetjs";
import { doNoteName, toNumberChord } from "@/lib/chord-numbers";
import { parseSections } from "@/lib/chord-sheet";
import { cn } from "@/lib/utils";

type ChordSheetProps = {
  content: string;
  originalKey: string;
  currentKey: string;
  // mode lirik saja untuk penyanyi
  lyricsOnly?: boolean;
  // chord ditulis sebagai angka (Do = ...) sesuai key yang sedang dipilih
  chordNumbers?: boolean;
  // ukuran huruf dalam rem, semua ukuran di dalamnya ikut membesar
  fontScale?: number;
};

// bagian tanpa lirik (intro, interlude) disembunyikan di mode lirik saja
function hasLyricLine(lines: Line[]) {
  return lines.some((line) =>
    line.items.some((item) => item instanceof ChordLyricsPair && item.lyrics?.trim()),
  );
}

// satu chord; di mode angka, tambahan yang diawali angka (7, 2, 9) ditulis kecil di atas
// supaya tidak tertukar dengan nomor nadanya (1⁷ bukan 17)
function ChordLabel({ chord, numberKey }: { chord: string; numberKey: string | null }) {
  const number = numberKey ? toNumberChord(chord, numberKey) : null;
  if (!number) return chord;

  const raisedSuffix = /^\d/.test(number.suffix);
  return (
    <>
      {number.degree}
      {raisedSuffix ? (
        <sup className="text-[0.7em] leading-none">{number.suffix}</sup>
      ) : (
        number.suffix
      )}
      {number.bass && `/${number.bass}`}
    </>
  );
}

type ChordLineProps = {
  line: Line;
  lyricsOnly: boolean;
  // key untuk chord angka, null kalau chord ditampilkan biasa
  numberKey: string | null;
};

function ChordLine({ line, lyricsOnly, numberKey }: ChordLineProps) {
  const pairs = line.items.filter((item) => item instanceof ChordLyricsPair);
  if (pairs.length === 0) return null;

  const hasLyrics = pairs.some((pair) => pair.lyrics?.trim());
  const hasChords = !lyricsOnly && pairs.some((pair) => pair.chords.trim());
  // baris chord saja (intro, interlude) tidak ditampilkan di mode lirik saja
  if (!hasLyrics && !hasChords) return null;

  return (
    <div className="flex flex-wrap items-end">
      {pairs.map((pair, index) => (
        <span key={index} className="inline-flex flex-col">
          {hasChords && (
            <span
              className={cn(
                "min-h-[1.4em] font-mono text-[0.875em] leading-[1.4] font-bold",
                // baris chord saja (intro, interlude) diberi jarak lebih lebar
                hasLyrics ? "pr-[0.4em]" : "pr-[0.8em]",
              )}
            >
              <ChordLabel chord={pair.chords.trim()} numberKey={numberKey} />
            </span>
          )}
          {/* tinggi tetap walau kosong, supaya chord di ujung baris tidak turun sejajar lirik */}
          {hasLyrics && (
            <span className="min-h-[1.5em] leading-[1.5] whitespace-pre-wrap">{pair.lyrics}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function ChordSheet({
  content,
  originalKey,
  currentKey,
  lyricsOnly = false,
  chordNumbers = false,
  fontScale = 1,
}: ChordSheetProps) {
  const sections = useMemo(
    () => parseSections(content, originalKey, currentKey),
    [content, originalKey, currentKey],
  );
  const doNote = chordNumbers && !lyricsOnly ? doNoteName(currentKey) : null;

  return (
    <div className="space-y-[1.5em]" style={{ fontSize: `${fontScale}rem` }}>
      {doNote && <p className="text-[0.875em] font-semibold">Do = {doNote}</p>}
      {sections
        .filter((section) => !lyricsOnly || hasLyricLine(section.song.lines))
        .map((section, index) => (
          <section key={index}>
            {section.label && (
              <h3 className="mb-[0.5em] text-[0.75em] font-semibold tracking-wide text-muted-foreground uppercase">
                {section.label}
              </h3>
            )}
            <div className={lyricsOnly ? "space-y-[0.15em]" : "space-y-[0.4em]"}>
              {section.song.lines.map((line, lineIndex) => (
                <ChordLine
                  key={lineIndex}
                  line={line}
                  lyricsOnly={lyricsOnly}
                  numberKey={doNote ? currentKey : null}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
