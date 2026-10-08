"use client";

import { Fragment, useMemo } from "react";
import { doNoteName, numberChordParts } from "@/lib/chord-numbers";
import { lineToRows, parseSections, type SheetLine } from "@/lib/chord-sheet";
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
function hasLyricLine(lines: SheetLine[]) {
  return lines.some((line) => line.hasLyrics);
}

// satu chord, atau chord angka kalau numberKey diisi
function ChordLabel({ chord, numberKey }: { chord: string; numberKey: string | null }) {
  if (!numberKey) return chord;

  return numberChordParts(chord, numberKey).map((part, index) =>
    part.raised ? (
      <sup key={index} className="text-[0.7em] leading-none">
        {part.text}
      </sup>
    ) : (
      <Fragment key={index}>{part.text}</Fragment>
    ),
  );
}

type SheetLineViewProps = {
  line: SheetLine;
  lyricsOnly: boolean;
  // key untuk chord angka, null kalau chord ditampilkan biasa
  numberKey: string | null;
};

// angka kecil (5⁷) di baris monospace tetap selebar kolomnya, supaya chord berikutnya tidak bergeser
const RAISED_SCALE = 0.7;

// baris yang ada not angkanya ditampilkan monospace persis seperti yang diketik,
// supaya setiap not tepat di atas suku katanya
function AlignedRows({
  line,
  showChords,
  numberKey,
}: Omit<SheetLineViewProps, "lyricsOnly"> & { showChords: boolean }) {
  const rows = lineToRows(
    line,
    numberKey ? (chord) => numberChordParts(chord, numberKey) : undefined,
  );

  return (
    <div className="overflow-x-auto font-mono text-[0.9em] whitespace-pre">
      {showChords && rows.chords && (
        <div className="leading-[1.4] font-bold">
          {rows.chordParts.map((part, index) =>
            part.raised ? (
              <span
                key={index}
                className="inline-block align-super text-[0.7em] leading-none"
                style={{ width: `${part.text.length / RAISED_SCALE}ch` }}
              >
                {part.text}
              </span>
            ) : (
              <Fragment key={index}>{part.text}</Fragment>
            ),
          )}
        </div>
      )}
      {/* not angka melodi: tidak ikut berubah walau key diganti */}
      {rows.melody.map((row, index) => (
        <div key={index} className="leading-[1.4]">
          {row}
        </div>
      ))}
      {rows.lyrics && <div className="leading-[1.5]">{rows.lyrics}</div>}
    </div>
  );
}

function SheetLineView({ line, lyricsOnly, numberKey }: SheetLineViewProps) {
  const showChords = !lyricsOnly && line.hasChords;
  const showMelody = !lyricsOnly && line.hasMelody;
  // baris chord atau not saja (intro, interlude) tidak ditampilkan di mode lirik saja
  if (!showChords && !showMelody && !line.hasLyrics) return null;

  // lirik saja: satu baris utuh, supaya tidak terpotong di tengah kata saat turun baris
  if (!showChords && !showMelody) {
    return (
      <p className="min-h-[1.5em] leading-[1.5] whitespace-pre-wrap">
        {line.segments.map((segment) => segment.lyrics).join("")}
      </p>
    );
  }

  if (showMelody) {
    return <AlignedRows line={line} showChords={showChords} numberKey={numberKey} />;
  }

  return (
    <div className="flex flex-wrap items-end">
      {line.segments
        .filter((segment) => segment.chord || segment.lyrics)
        .map((segment, index) => (
          <span key={index} className="inline-flex flex-col">
            <span
              className={cn(
                "min-h-[1.4em] font-mono text-[0.875em] leading-[1.4] font-bold",
                // baris chord saja (intro, interlude) diberi jarak lebih lebar
                line.hasLyrics ? "pr-[0.4em]" : "pr-[0.8em]",
              )}
            >
              <ChordLabel chord={segment.chord} numberKey={numberKey} />
            </span>
            {/* tinggi tetap walau kosong, supaya chord di ujung baris tidak turun sejajar lirik */}
            {line.hasLyrics && (
              <span className="min-h-[1.5em] leading-[1.5] whitespace-pre-wrap">
                {segment.lyrics}
              </span>
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
  const hasMelody = sections.some((section) => section.lines.some((line) => line.hasMelody));
  // nada Do dibutuhkan untuk chord angka dan untuk membaca not angka melodi
  const doNote = (chordNumbers || hasMelody) && !lyricsOnly ? doNoteName(currentKey) : null;

  return (
    <div className="space-y-[1.5em]" style={{ fontSize: `${fontScale}rem` }}>
      {doNote && <p className="text-[0.875em] font-semibold">Do = {doNote}</p>}
      {sections
        .filter((section) => !lyricsOnly || hasLyricLine(section.lines))
        .map((section, index) => (
          <section key={index}>
            {section.label && (
              <h3 className="mb-[0.5em] text-[0.75em] font-semibold tracking-wide text-muted-foreground uppercase">
                {section.label}
              </h3>
            )}
            <div className={lyricsOnly ? "space-y-[0.15em]" : "space-y-[0.4em]"}>
              {section.lines.map((line, lineIndex) => (
                <SheetLineView
                  key={lineIndex}
                  line={line}
                  lyricsOnly={lyricsOnly}
                  numberKey={chordNumbers ? currentKey : null}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
