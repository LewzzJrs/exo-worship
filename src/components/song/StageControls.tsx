"use client";

import {
  MinusIcon,
  MonitorSmartphoneIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TextIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StageControlsProps = {
  canZoomOut: boolean;
  canZoomIn: boolean;
  onZoom: (step: number) => void;
  lyricsOnly: boolean;
  onToggleLyricsOnly: () => void;
  wakeLock: { isSupported: boolean; isActive: boolean; onToggle: () => void };
  scroll: {
    isScrolling: boolean;
    speedLevel: number;
    maxSpeedLevel: number;
    onToggle: () => void;
    onSpeed: (step: number) => void;
  };
};

// alat bantu saat bermain: ukuran huruf, lirik saja, layar menyala, gulir otomatis
export default function StageControls({
  canZoomOut,
  canZoomIn,
  onZoom,
  lyricsOnly,
  onToggleLyricsOnly,
  wakeLock,
  scroll,
}: StageControlsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border bg-card">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Perkecil huruf"
            disabled={!canZoomOut}
            onClick={() => onZoom(-1)}
          >
            <span className="text-xs font-semibold">A−</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Perbesar huruf"
            disabled={!canZoomIn}
            onClick={() => onZoom(1)}
          >
            <span className="text-base font-semibold">A+</span>
          </Button>
        </div>

        <Button
          variant={lyricsOnly ? "default" : "outline"}
          className={cn(!lyricsOnly && "bg-card")}
          aria-pressed={lyricsOnly}
          onClick={onToggleLyricsOnly}
        >
          <TextIcon />
          Lirik saja
        </Button>

        {wakeLock.isSupported && (
          <Button
            variant={wakeLock.isActive ? "default" : "outline"}
            className={cn(!wakeLock.isActive && "bg-card")}
            aria-pressed={wakeLock.isActive}
            onClick={wakeLock.onToggle}
          >
            <MonitorSmartphoneIcon />
            Layar tetap nyala
          </Button>
        )}

        {!scroll.isScrolling && (
          <Button variant="outline" className="bg-card" onClick={scroll.onToggle}>
            <PlayIcon />
            Gulir otomatis
          </Button>
        )}
      </div>

      {/* kontrol mengambang selama gulir otomatis, di atas navigasi bawah HP */}
      {scroll.isScrolling && (
        <div className="fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-foreground p-1 text-background shadow-lg md:bottom-6">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-background/15 hover:text-background"
            aria-label="Jeda gulir otomatis"
            onClick={scroll.onToggle}
          >
            <PauseIcon />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-background/15 hover:text-background"
            aria-label="Pelankan"
            disabled={scroll.speedLevel <= 1}
            onClick={() => scroll.onSpeed(-1)}
          >
            <MinusIcon />
          </Button>
          <span className="min-w-14 text-center text-xs font-medium tabular-nums">
            Speed {scroll.speedLevel}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-background/15 hover:text-background"
            aria-label="Percepat"
            disabled={scroll.speedLevel >= scroll.maxSpeedLevel}
            onClick={() => scroll.onSpeed(1)}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
    </>
  );
}
