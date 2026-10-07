import { create } from "zustand";
import { persist } from "zustand/middleware";

// pengaturan tampilan lagu, diingat di HP masing-masing
export const FONT_SCALES = [0.875, 1, 1.125, 1.25, 1.5, 1.75, 2];
export const SCROLL_SPEEDS = [12, 20, 30, 42, 56];

type ViewerState = {
  fontScaleIndex: number;
  lyricsOnly: boolean;
  scrollSpeedIndex: number;
  changeFontScale: (step: number) => void;
  toggleLyricsOnly: () => void;
  changeScrollSpeed: (step: number) => void;
};

function clamp(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}

export const useViewerStore = create<ViewerState>()(
  persist(
    (set) => ({
      fontScaleIndex: 1,
      lyricsOnly: false,
      scrollSpeedIndex: 1,
      changeFontScale: (step) =>
        set((state) => ({
          fontScaleIndex: clamp(state.fontScaleIndex + step, FONT_SCALES.length - 1),
        })),
      toggleLyricsOnly: () => set((state) => ({ lyricsOnly: !state.lyricsOnly })),
      changeScrollSpeed: (step) =>
        set((state) => ({
          scrollSpeedIndex: clamp(state.scrollSpeedIndex + step, SCROLL_SPEEDS.length - 1),
        })),
    }),
    { name: "exo-viewer" },
  ),
);
