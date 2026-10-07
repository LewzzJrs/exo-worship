import path from "node:path";
import { Font } from "@react-pdf/renderer";
import type { PdfFont } from "@/lib/pdf-options";

// font tambahan untuk PDF (lisensi SIL OFL, lihat src/fonts), dibaca dari file di server
const fontDir = path.join(process.cwd(), "src", "fonts");

Font.register({
  family: "JetBrains Mono",
  fonts: [
    { src: path.join(fontDir, "JetBrainsMono-Regular.woff") },
    { src: path.join(fontDir, "JetBrainsMono-Bold.woff"), fontWeight: "bold" },
  ],
});

Font.register({
  family: "IBM Plex Mono",
  fonts: [
    { src: path.join(fontDir, "IBMPlexMono-Regular.woff") },
    { src: path.join(fontDir, "IBMPlexMono-Bold.woff"), fontWeight: "bold" },
  ],
});

// kata tidak dipotong dengan tanda hubung, supaya baris lirik tetap utuh
Font.registerHyphenationCallback((word) => [word]);

// gaya huruf untuk baris chord dan lirik sesuai pilihan
export function chordSheetFonts(font: PdfFont) {
  switch (font) {
    case "jetbrains":
      return {
        chords: { fontFamily: "JetBrains Mono", fontWeight: "bold" as const },
        lyrics: { fontFamily: "JetBrains Mono" },
      };
    case "plex":
      return {
        chords: { fontFamily: "IBM Plex Mono", fontWeight: "bold" as const },
        lyrics: { fontFamily: "IBM Plex Mono" },
      };
    default:
      return { chords: { fontFamily: "Courier-Bold" }, lyrics: { fontFamily: "Courier" } };
  }
}
