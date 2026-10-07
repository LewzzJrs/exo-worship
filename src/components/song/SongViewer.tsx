"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChordSheet from "@/components/song/ChordSheet";
import StageControls from "@/components/song/StageControls";
import TransposeControl from "@/components/song/TransposeControl";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useHydrated } from "@/hooks/use-hydrated";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { isSameKey } from "@/lib/keys";
import { FONT_SCALES, SCROLL_SPEEDS, useViewerStore } from "@/store/viewer";

type SongViewerProps = {
  content: string;
  originalKey: string;
  initialKey: string;
};

export default function SongViewer({ content, originalKey, initialKey }: SongViewerProps) {
  const [currentKey, setCurrentKey] = useState(initialKey);
  const isHydrated = useHydrated();
  const viewer = useViewerStore();
  const wakeLock = useWakeLock();
  const { isScrolling, setIsScrolling } = useAutoScroll(SCROLL_SPEEDS[viewer.scrollSpeedIndex]);

  // pengaturan dari HP baru dipakai setelah halaman aktif, supaya tidak bentrok dengan HTML server
  const fontScaleIndex = isHydrated ? viewer.fontScaleIndex : 1;
  const lyricsOnly = isHydrated && viewer.lyricsOnly;

  function handleKeyChange(key: string) {
    setCurrentKey(key);
    // simpan key di URL supaya link yang dibagikan langsung terbuka di key yang sama
    const url = new URL(window.location.href);
    if (isSameKey(key, originalKey)) url.searchParams.delete("key");
    else url.searchParams.set("key", key);
    window.history.replaceState(null, "", url);
  }

  function handleToggleScroll() {
    // selama digulir otomatis, layar juga dijaga tetap menyala
    if (!isScrolling) wakeLock.setIsActive(true);
    setIsScrolling(!isScrolling);
  }

  return (
    <div className="space-y-4">
      <TransposeControl
        originalKey={originalKey}
        currentKey={currentKey}
        onChange={handleKeyChange}
      />
      <StageControls
        canZoomOut={fontScaleIndex > 0}
        canZoomIn={fontScaleIndex < FONT_SCALES.length - 1}
        onZoom={viewer.changeFontScale}
        lyricsOnly={lyricsOnly}
        onToggleLyricsOnly={viewer.toggleLyricsOnly}
        wakeLock={{
          isSupported: wakeLock.isSupported,
          isActive: wakeLock.isActive,
          onToggle: () => wakeLock.setIsActive(!wakeLock.isActive),
        }}
        scroll={{
          isScrolling,
          speedLevel: viewer.scrollSpeedIndex + 1,
          maxSpeedLevel: SCROLL_SPEEDS.length,
          onToggle: handleToggleScroll,
          onSpeed: viewer.changeScrollSpeed,
        }}
      />
      <Card>
        <CardContent>
          <ChordSheet
            content={content}
            originalKey={originalKey}
            currentKey={currentKey}
            lyricsOnly={lyricsOnly}
            fontScale={FONT_SCALES[fontScaleIndex]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
