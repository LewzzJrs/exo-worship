"use client";

import { useMemo } from "react";
import { ChordLyricsPair, type Line } from "chordsheetjs";
import { parseSections } from "@/lib/chord-sheet";
import { cn } from "@/lib/utils";

type ChordSheetProps = {
  content: string;
  originalKey: string;
  currentKey: string;
};

function ChordLine({ line }: { line: Line }) {
  const pairs = line.items.filter((item) => item instanceof ChordLyricsPair);
  if (pairs.length === 0) return null;

  const hasChords = pairs.some((pair) => pair.chords.trim());
  const hasLyrics = pairs.some((pair) => pair.lyrics?.trim());

  return (
    <div className="flex flex-wrap items-end">
      {pairs.map((pair, index) => (
        <span key={index} className="inline-flex flex-col">
          {hasChords && (
            <span
              className={cn(
                "min-h-5 font-mono text-sm leading-5 font-bold",
                // baris chord saja (intro, interlude) diberi jarak lebih lebar
                hasLyrics ? "pr-1.5" : "pr-3",
              )}
            >
              {pair.chords.trim()}
            </span>
          )}
          {/* tinggi tetap walau kosong, supaya chord di ujung baris tidak turun sejajar lirik */}
          {hasLyrics && (
            <span className="min-h-6 leading-6 whitespace-pre-wrap">{pair.lyrics}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function ChordSheet({ content, originalKey, currentKey }: ChordSheetProps) {
  const sections = useMemo(
    () => parseSections(content, originalKey, currentKey),
    [content, originalKey, currentKey],
  );

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <section key={index}>
          {section.label && (
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {section.label}
            </h3>
          )}
          <div className="space-y-1.5">
            {section.song.lines.map((line, lineIndex) => (
              <ChordLine key={lineIndex} line={line} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
