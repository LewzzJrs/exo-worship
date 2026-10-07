import "server-only";

import { verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import type { Setlist, SetlistItem } from "@/types/setlist";

type TeamSetlistRow = {
  id: string;
  name: string;
  date: string;
  items: SetlistItem[];
  created_at: string;
};

function toSetlist(row: TeamSetlistRow): Setlist {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    items: Array.isArray(row.items) ? row.items : [],
    createdAt: row.created_at,
  };
}

export async function getTeamSetlists() {
  await verifyAccess();

  const { data, error } = await getSupabase()
    .from("team_setlists")
    .select("id, name, date, items, created_at")
    .order("date", { ascending: false });
  if (error) {
    console.error("Gagal memuat setlist tim:", error.message);
    return [];
  }

  return (data as TeamSetlistRow[]).map(toSetlist);
}

export async function getTeamSetlist(id: string) {
  await verifyAccess();
  // id yang bukan UUID pasti tidak ada, tidak perlu bertanya ke database
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const { data, error } = await getSupabase()
    .from("team_setlists")
    .select("id, name, date, items, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("Gagal memuat setlist tim:", error.message);

  return data ? toSetlist(data as TeamSetlistRow) : null;
}
