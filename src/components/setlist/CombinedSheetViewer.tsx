"use client";

import CombinedSheet from "@/components/setlist/CombinedSheet";
import StageControls from "@/components/song/StageControls";
import { Card, CardContent } from "@/components/ui/card";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useHydrated } from "@/hooks/use-hydrated";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { FONT_SCALES, SCROLL_SPEEDS, useViewerStore } from "@/store/viewer";

type CombinedSheetViewerProps = {
  content: string;
  fallbackKey: string | null;
};

// lembar gabungan dengan alat bantu panggung yang sama seperti halaman lagu
// (key sudah ditentukan admin per lagu, jadi tidak ada transpose di sini)
export default function CombinedSheetViewer({ content, fallbackKey }: CombinedSheetViewerProps) {
  const isHydrated = useHydrated();
  const viewer = useViewerStore();
  const scrollSpeed = SCROLL_SPEEDS[viewer.scrollSpeedIndex] ?? SCROLL_SPEEDS[1];
  const wakeLock = useWakeLock();
  const { isScrolling, setIsScrolling } = useAutoScroll(scrollSpeed.pixelsPerSecond);

  // pengaturan dari HP baru dipakai setelah halaman aktif, supaya tidak bentrok dengan HTML server
  const fontScaleIndex = isHydrated ? viewer.fontScaleIndex : 1;
  const lyricsOnly = isHydrated && viewer.lyricsOnly;
  const chordNumbers = isHydrated && viewer.chordNumbers;

  function handleToggleScroll() {
    // selama digulir otomatis, layar juga dijaga tetap menyala
    if (!isScrolling) wakeLock.setIsActive(true);
    setIsScrolling(!isScrolling);
  }

  return (
    <div className="space-y-4">
      <StageControls
        canZoomOut={fontScaleIndex > 0}
        canZoomIn={fontScaleIndex < FONT_SCALES.length - 1}
        onZoom={viewer.changeFontScale}
        lyricsOnly={lyricsOnly}
        chordNumbers={chordNumbers}
        onToggleChordNumbers={viewer.toggleChordNumbers}
        onToggleLyricsOnly={viewer.toggleLyricsOnly}
        wakeLock={{
          isSupported: wakeLock.isSupported,
          isActive: wakeLock.isActive,
          onToggle: () => wakeLock.setIsActive(!wakeLock.isActive),
        }}
        scroll={{
          isScrolling,
          speedLabel: scrollSpeed.label,
          canSlower: viewer.scrollSpeedIndex > 0,
          canFaster: viewer.scrollSpeedIndex < SCROLL_SPEEDS.length - 1,
          onToggle: handleToggleScroll,
          onSpeed: viewer.changeScrollSpeed,
        }}
      />
      <Card>
        <CardContent>
          <CombinedSheet
            content={content}
            fallbackKey={fallbackKey}
            lyricsOnly={lyricsOnly}
            chordNumbers={chordNumbers}
            fontScale={FONT_SCALES[fontScaleIndex]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
