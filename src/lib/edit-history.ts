import "server-only";

import { verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";

export type EditEntry = {
  name: string;
  // waktu edit terakhir orang itu di hari tersebut
  at: string;
  // berapa kali disimpan di hari yang sama
  count: number;
};

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });

// semua edit sebuah lagu atau setlist dari riwayat admin, terbaru di atas.
// edit oleh orang yang sama di hari yang sama digabung jadi satu baris
export async function getEditHistory(entity: "lagu" | "setlist", id: string) {
  await verifyAccess();

  const { data, error } = await getSupabase()
    .from("admin_activity")
    .select("admin_name, created_at")
    .eq("entity", entity)
    .eq("entity_id", id)
    .eq("action", "diubah")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("Gagal memuat riwayat edit:", error.message);
    return [];
  }

  const entries: EditEntry[] = [];
  for (const row of data as { admin_name: string; created_at: string }[]) {
    const last = entries.at(-1);
    const sameDay =
      last &&
      last.name === row.admin_name &&
      dayFormat.format(new Date(last.at)) === dayFormat.format(new Date(row.created_at));
    if (sameDay) last.count++;
    else entries.push({ name: row.admin_name, at: row.created_at, count: 1 });
  }
  return entries;
}
