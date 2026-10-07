"use client";

import { useMemo } from "react";
import { ChordLyricsPair, type Line } from "chordsheetjs";
import { parseSections } from "@/lib/chord-sheet";
import { cn } from "@/lib/utils";

type ChordSheetProps = {
  content: string;
  originalKey: string;
  currentKey: string;
  // mode lirik saja untuk penyanyi
  lyricsOnly?: boolean;
  // ukuran huruf dalam rem, semua ukuran di dalamnya ikut membesar
  fontScale?: number;
};

// bagian tanpa lirik (intro, interlude) disembunyikan di mode lirik saja
function hasLyricLine(lines: Line[]) {
  return lines.some((line) =>
    line.items.some((item) => item instanceof ChordLyricsPair && item.lyrics?.trim()),
  );
}

function ChordLine({ line, lyricsOnly }: { line: Line; lyricsOnly: boolean }) {
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
              {pair.chords.trim()}
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
  fontScale = 1,
}: ChordSheetProps) {
  const sections = useMemo(
    () => parseSections(content, originalKey, currentKey),
    [content, originalKey, currentKey],
  );

  return (
    <div className="space-y-[1.5em]" style={{ fontSize: `${fontScale}rem` }}>
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
                <ChordLine key={lineIndex} line={line} lyricsOnly={lyricsOnly} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
