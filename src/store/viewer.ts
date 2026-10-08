import { create } from "zustand";
import { persist } from "zustand/middleware";

// pengaturan tampilan lagu, diingat di HP masing-masing
export const FONT_SCALES = [0.875, 1, 1.125, 1.25, 1.5, 1.75, 2];
// kecepatan gulir otomatis: 1× = 10 pixel per detik
export const SCROLL_SPEEDS = [
  { label: "0,5×", pixelsPerSecond: 5 },
  { label: "1×", pixelsPerSecond: 10 },
  { label: "1,5×", pixelsPerSecond: 15 },
  { label: "2×", pixelsPerSecond: 20 },
];
const DEFAULT_SCROLL_SPEED_INDEX = 1;

type ViewerState = {
  fontScaleIndex: number;
  lyricsOnly: boolean;
  // chord ditampilkan sebagai angka (Do = ...)
  chordNumbers: boolean;
  scrollSpeedIndex: number;
  changeFontScale: (step: number) => void;
  toggleLyricsOnly: () => void;
  toggleChordNumbers: () => void;
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
      chordNumbers: false,
      scrollSpeedIndex: DEFAULT_SCROLL_SPEED_INDEX,
      changeFontScale: (step) =>
        set((state) => ({
          fontScaleIndex: clamp(state.fontScaleIndex + step, FONT_SCALES.length - 1),
        })),
      toggleLyricsOnly: () => set((state) => ({ lyricsOnly: !state.lyricsOnly })),
      toggleChordNumbers: () => set((state) => ({ chordNumbers: !state.chordNumbers })),
      changeScrollSpeed: (step) =>
        set((state) => ({
          scrollSpeedIndex: clamp(state.scrollSpeedIndex + step, SCROLL_SPEEDS.length - 1),
        })),
    }),
    {
      name: "exo-viewer",
      version: 1,
      // versi lama punya 5 tingkat kecepatan, dikembalikan ke 1× supaya tidak terlalu cepat
      migrate: (persisted, version) => {
        const state = persisted as ViewerState;
        return version < 1 ? { ...state, scrollSpeedIndex: DEFAULT_SCROLL_SPEED_INDEX } : state;
      },
    },
  ),
);
