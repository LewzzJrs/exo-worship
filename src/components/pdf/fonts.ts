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

// ligatur dimatikan: JetBrains Mono menggabung "||" dan "..." jadi satu simbol (dan membuat PDF gagal),
// padahal tiap huruf harus tetap selebar satu kolom
const NO_LIGATURES = { liga: false, calt: false };

// gaya huruf untuk baris chord dan lirik sesuai pilihan
export function chordSheetFonts(font: PdfFont) {
  switch (font) {
    case "jetbrains":
      return {
        chords: {
          fontFamily: "JetBrains Mono",
          fontWeight: "bold" as const,
          fontFeatureSettings: NO_LIGATURES,
        },
        lyrics: { fontFamily: "JetBrains Mono", fontFeatureSettings: NO_LIGATURES },
      };
    case "plex":
      return {
        chords: {
          fontFamily: "IBM Plex Mono",
          fontWeight: "bold" as const,
          fontFeatureSettings: NO_LIGATURES,
        },
        lyrics: { fontFamily: "IBM Plex Mono", fontFeatureSettings: NO_LIGATURES },
      };
    default:
      return { chords: { fontFamily: "Courier-Bold" }, lyrics: { fontFamily: "Courier" } };
  }
}
