import type { SetlistItem } from "@/types/setlist";

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "2026-10-11" -> "Minggu, 11 Oktober 2026"
export function formatSetlistDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : dateFormat.format(parsed);
}

// tanggal hari Minggu terdekat, untuk isian awal setlist baru
export function nextSunday(from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7 || 7));
  return date.toLocaleDateString("en-CA");
}

type PdfOptions = {
  items: SetlistItem[];
  name?: string;
  date?: string;
};

// link PDF: songs=slug:key,slug:key (+ nama dan tanggal kalau setlist)
export function buildPdfUrl({ items, name, date }: PdfOptions) {
  const params = new URLSearchParams({
    songs: items.map((item) => `${item.slug}:${item.key}`).join(","),
  });
  if (name) params.set("name", name);
  if (date) params.set("date", date);
  return `/api/pdf?${params.toString()}`;
}
