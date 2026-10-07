import "server-only";

import { verifyAccess } from "@/lib/dal";
import { getSongs } from "@/lib/songs";
import { getSupabase } from "@/lib/supabase";

// rekomendasi disimpan per bulan di app_settings, kuncinya "rekomendasi:2026-10"
export type MonthlyRecommendation = {
  slugs: string[];
  updatedBy: string;
  updatedAt: string;
};

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function recommendationKey(month: string) {
  return `rekomendasi:${month}`;
}

// bulan sekarang menurut waktu Indonesia (WIB), format YYYY-MM
export function currentMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7);
}

// "2026-10" -> "Oktober 2026"
export function formatMonth(month: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

// "2026-10" + 1 -> "2026-11"
export function shiftMonth(month: string, step: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + step, 1));
  return date.toISOString().slice(0, 7);
}

export async function getRecommendation(month: string): Promise<MonthlyRecommendation | null> {
  await verifyAccess();

  const { data, error } = await getSupabase()
    .from("app_settings")
    .select("value")
    .eq("key", recommendationKey(month))
    .maybeSingle();
  if (error) console.error("Gagal memuat rekomendasi:", error.message);
  if (!data) return null;

  try {
    return JSON.parse(data.value) as MonthlyRecommendation;
  } catch {
    return null;
  }
}

// lagu rekomendasi bulan ini untuk beranda, lagu yang sudah dihapus dilewati
export async function getMonthlyRecommendedSongs() {
  const month = currentMonth();
  const [recommendation, songs] = await Promise.all([getRecommendation(month), getSongs()]);

  return {
    month,
    updatedBy: recommendation?.updatedBy,
    songs: (recommendation?.slugs ?? [])
      .map((slug) => songs.find((song) => song.slug === slug))
      .filter((song) => song !== undefined),
  };
}
