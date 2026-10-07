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

export type PdfFont = (typeof PDF_FONTS)[number]["id"];

export type PdfOptions = {
  font: PdfFont;
  size: number;
};

export const DEFAULT_PDF_OPTIONS: PdfOptions = { font: "courier", size: 10 };

// nilai dari URL yang tidak dikenal kembali ke bawaan
export function parsePdfOptions(font: string | null, size: string | null): PdfOptions {
  const fontId = PDF_FONTS.find((option) => option.id === font)?.id;
  const sizeValue = PDF_SIZES.find((option) => option.value === Number(size))?.value;
  return {
    font: fontId ?? DEFAULT_PDF_OPTIONS.font,
    size: sizeValue ?? DEFAULT_PDF_OPTIONS.size,
  };
}

// tambahkan pilihan font dan ukuran ke link PDF
export function withPdfOptions(url: string, options: PdfOptions) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}font=${options.font}&size=${options.size}`;
}
