import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PDF_OPTIONS, type PdfFont } from "@/lib/pdf-options";

// pilihan font dan ukuran PDF terakhir, diingat di HP masing-masing
type PdfPrefsState = {
  font: PdfFont;
  size: number;
  setFont: (font: PdfFont) => void;
  setSize: (size: number) => void;
};

export const usePdfPrefsStore = create<PdfPrefsState>()(
  persist(
    (set) => ({
      ...DEFAULT_PDF_OPTIONS,
      setFont: (font) => set({ font }),
      setSize: (size) => set({ size }),
    }),
    { name: "exo-pdf" },
  ),
);
