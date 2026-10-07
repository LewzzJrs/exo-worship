"use server";

import { getDeviceId, verifyAccess } from "@/lib/dal";
import { songExists } from "@/lib/songs";
import { getLikeSummary, type LikeSummary } from "@/lib/stats";
import { getSupabase } from "@/lib/supabase";

// dicatat saat halaman lagu dibuka, satu HP dihitung sekali per hari (diatur di database)
export async function recordView(slug: string) {
  await verifyAccess();
  const deviceId = await getDeviceId();
  if (!deviceId || !(await songExists(slug))) return;

  const { error } = await getSupabase()
    .from("song_views")
    .upsert(
      { song_slug: slug, device_id: deviceId },
      { onConflict: "song_slug,device_id,viewed_on", ignoreDuplicates: true },
    );
  if (error) console.error("Gagal mencatat view:", error.message);
}

export async function toggleLike(slug: string): Promise<LikeSummary | { error: string }> {
  await verifyAccess();
  const deviceId = await getDeviceId();
  if (!deviceId || !(await songExists(slug))) return { error: "Lagu tidak ditemukan" };

  const supabase = getSupabase();
  const { liked } = await getLikeSummary(slug);

  const { error } = liked
    ? await supabase.from("song_likes").delete().eq("song_slug", slug).eq("device_id", deviceId)
    : await supabase
        .from("song_likes")
        .upsert({ song_slug: slug, device_id: deviceId }, { ignoreDuplicates: true });

  if (error) {
    console.error("Gagal menyimpan suka:", error.message);
    return { error: "Gagal menyimpan suka, coba lagi" };
  }

  return getLikeSummary(slug);
}
