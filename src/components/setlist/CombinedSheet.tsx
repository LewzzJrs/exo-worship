"use client";

import { useMemo } from "react";
import ChordSheet from "@/components/song/ChordSheet";
import { parseCombinedSheet } from "@/lib/combined-sheet";

type CombinedSheetProps = {
  content: string;
  // key untuk teks sebelum judul lagu pertama (biasanya key lagu pertama di setlist)
  fallbackKey: string | null;
  lyricsOnly?: boolean;
  chordNumbers?: boolean;
  fontScale?: number;
};

// lembar gabungan setlist: setiap lagu (atau pindah key) diberi judul, isinya seperti halaman lagu
export default function CombinedSheet({
  content,
  fallbackKey,
  lyricsOnly = false,
  chordNumbers = false,
  fontScale = 1,
}: CombinedSheetProps) {
  const parts = useMemo(() => parseCombinedSheet(content, fallbackKey), [content, fallbackKey]);

  return (
    <div className="space-y-[2em]" style={{ fontSize: `${fontScale}rem` }}>
      {parts.map((part, index) => (
        <section key={index}>
          {(part.title || part.isKeyChange) && (
            <div className="mb-[0.75em] flex flex-wrap items-baseline gap-x-2 border-b pb-[0.35em]">
              {part.title ? (
                <h2 className="text-[1.125em] font-semibold">{part.title}</h2>
              ) : (
                <p className="text-[0.75em] font-semibold tracking-wide text-muted-foreground uppercase">
                  Pindah key
                </p>
              )}
              {part.key && !lyricsOnly && (
                <span className="text-[0.8em] text-muted-foreground">Key {part.key}</span>
              )}
            </div>
          )}
          <ChordSheet
            content={part.content}
            originalKey={part.key ?? ""}
            currentKey={part.key ?? ""}
            lyricsOnly={lyricsOnly}
            chordNumbers={chordNumbers}
            fontScale={fontScale}
          />
        </section>
      ))}
    </div>
  );
}
