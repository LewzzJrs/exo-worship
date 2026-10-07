import "server-only";

import { getDeviceId, verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";

export type LikeSummary = {
  count: number;
  liked: boolean;
};

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
