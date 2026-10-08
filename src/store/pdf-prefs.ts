import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PDF_OPTIONS, type PdfChordStyle, type PdfFont } from "@/lib/pdf-options";

// pilihan font, ukuran, dan jenis chord PDF terakhir, diingat di HP masing-masing
type PdfPrefsState = {
  font: PdfFont;
  size: number;
  chords: PdfChordStyle;
  setFont: (font: PdfFont) => void;
  setSize: (size: number) => void;
  setChords: (chords: PdfChordStyle) => void;
};

export const usePdfPrefsStore = create<PdfPrefsState>()(
  persist(
    (set) => ({
      ...DEFAULT_PDF_OPTIONS,
      setFont: (font) => set({ font }),
      setSize: (size) => set({ size }),
      setChords: (chords) => set({ chords }),
    }),
    { name: "exo-pdf" },
  ),
);
