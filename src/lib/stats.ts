import "server-only";

import { getDeviceId, verifyAccess } from "@/lib/dal";
import { getSongs } from "@/lib/songs";
import { getSupabase } from "@/lib/supabase";
import type { SongSummary } from "@/types/song";

export type LikeSummary = {
  count: number;
  liked: boolean;
};

// trending 7 hari terakhir: anggota yang membuka lagu + suka (dihitung 2x)
export async function getTrendingSongs(limit = 5): Promise<SongSummary[]> {
  await verifyAccess();

  const { data, error } = await getSupabase().rpc("trending_songs", {
    days: 7,
    max_results: limit,
  });
  if (error) {
    // trending gagal dimuat jangan sampai membuat beranda error
    console.error("Gagal memuat trending:", error.message);
    return [];
  }

  const songs = await getSongs();
  return (data as { song_slug: string }[])
    .map((row) => songs.find((song) => song.slug === row.song_slug))
    .filter((song) => song !== undefined);
}

export async function getLikeSummary(slug: string): Promise<LikeSummary> {
  await verifyAccess();
  const deviceId = await getDeviceId();
  const supabase = getSupabase();

  const [countResult, likedResult] = await Promise.all([
    supabase.from("song_likes").select("*", { count: "exact", head: true }).eq("song_slug", slug),
    deviceId
      ? supabase
          .from("song_likes")
          .select("song_slug")
          .eq("song_slug", slug)
          .eq("device_id", deviceId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (countResult.error || likedResult.error) {
    console.error("Gagal memuat suka:", countResult.error?.message ?? likedResult.error?.message);
  }

  return { count: countResult.count ?? 0, liked: !!likedResult.data };
}
