// pilihan tampilan PDF, dipakai di dialog preview (browser) dan route /api/pdf (server)

// semua font di sini monospace, supaya posisi chord tetap pas di atas lirik
export const PDF_FONTS = [
  { id: "courier", label: "Courier (mesin ketik)" },
  { id: "jetbrains", label: "JetBrains Mono (modern)" },
  { id: "plex", label: "IBM Plex Mono (lembut)" },
] as const;

export const PDF_SIZES = [
  { value: 9, label: "Kecil" },
  { value: 10, label: "Normal" },
  { value: 12, label: "Besar" },
  { value: 14, label: "Sangat besar" },
] as const;

// chord biasa atau chord angka (Do = ...)
export const PDF_CHORD_STYLES = [
  { id: "huruf", label: "Huruf (G, C, D)" },
  { id: "angka", label: "Angka (1, 4, 5)" },
] as const;

export type PdfFont = (typeof PDF_FONTS)[number]["id"];
export type PdfChordStyle = (typeof PDF_CHORD_STYLES)[number]["id"];

export type PdfOptions = {
  font: PdfFont;
  size: number;
  chords: PdfChordStyle;
};

export const DEFAULT_PDF_OPTIONS: PdfOptions = { font: "courier", size: 10, chords: "huruf" };

// nilai dari URL yang tidak dikenal kembali ke bawaan
export function parsePdfOptions(params: URLSearchParams): PdfOptions {
  const font = PDF_FONTS.find((option) => option.id === params.get("font"))?.id;
  const size = PDF_SIZES.find((option) => option.value === Number(params.get("size")))?.value;
  const chords = PDF_CHORD_STYLES.find((option) => option.id === params.get("chords"))?.id;
  return {
    font: font ?? DEFAULT_PDF_OPTIONS.font,
    size: size ?? DEFAULT_PDF_OPTIONS.size,
    chords: chords ?? DEFAULT_PDF_OPTIONS.chords,
  };
}

// tambahkan pilihan font, ukuran, dan jenis chord ke link PDF
export function withPdfOptions(url: string, options: PdfOptions) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}font=${options.font}&size=${options.size}&chords=${options.chords}`;
}
