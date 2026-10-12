import "server-only";

import { cache } from "react";
import { verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import type { Setlist, SetlistItem } from "@/types/setlist";

type TeamSetlistRow = {
  id: string;
  name: string;
  date: string;
  items: SetlistItem[];
  // kolom baru; belum ada kalau SQL terbaru belum dijalankan
  combined_sheet?: string | null;
  created_at: string;
  created_by: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

const COLUMNS = "id, name, date, items, created_at, created_by, updated_by, updated_at";

function toSetlist(row: TeamSetlistRow): Setlist {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    items: Array.isArray(row.items) ? row.items : [],
    combinedSheet: row.combined_sheet ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function getTeamSetlists() {
  await verifyAccess();

  const { data, error } = await getSupabase()
    .from("team_setlists")
    .select(COLUMNS)
    .order("date", { ascending: false });
  if (error) {
    console.error("Gagal memuat setlist tim:", error.message);
    return [];
  }

  return (data as TeamSetlistRow[]).map(toSetlist);
}

// cache: judul tab dan isi halaman memakai setlist yang sama, cukup sekali ambil per request
export const getTeamSetlist = cache(async (id: string) => {
  await verifyAccess();
  // id yang bukan UUID pasti tidak ada, tidak perlu bertanya ke database
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const { data, error } = await getSupabase()
    .from("team_setlists")
    // semua kolom, termasuk lembar gabungan (tetap jalan walau kolomnya belum dibuat)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("Gagal memuat setlist tim:", error.message);

  return data ? toSetlist(data as TeamSetlistRow) : null;
});
