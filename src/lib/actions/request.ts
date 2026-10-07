"use server";

import { refresh } from "next/cache";
import { getDeviceId, verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import { requestSchema, type RequestValues } from "@/lib/validations/request";

// batas supaya form tidak bisa dipakai untuk spam
const MAX_REQUESTS_PER_DAY = 5;

export async function createRequest(values: RequestValues) {
  await verifyAccess();
  const deviceId = await getDeviceId();
  if (!deviceId) {
    return { error: "Muat ulang halaman, lalu kirim lagi." };
  }

  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = getSupabase();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("song_requests")
    .select("*", { count: "exact", head: true })
    .eq("device_id", deviceId)
    .gte("created_at", since);

  if (countError) {
    console.error("Gagal mengecek jumlah request:", countError.message);
    return { error: "Gagal mengirim request, coba lagi." };
  }
  if ((count ?? 0) >= MAX_REQUESTS_PER_DAY) {
    return { error: `Maksimal ${MAX_REQUESTS_PER_DAY} request per hari dari satu HP.` };
  }

  const { requesterName, title, artist, youtubeUrl, note } = parsed.data;
  const { error } = await supabase.from("song_requests").insert({
    device_id: deviceId,
    requester_name: requesterName,
    title,
    artist: artist || null,
    youtube_url: youtubeUrl || null,
    note: note || null,
  });

  if (error) {
    console.error("Gagal menyimpan request:", error.message);
    return { error: "Gagal mengirim request, coba lagi." };
  }

  // daftar "Request saya" langsung ikut diperbarui
  refresh();
  return { success: true };
}
