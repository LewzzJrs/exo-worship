import "server-only";

import { getDeviceId, verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import type { SongRequest } from "@/types/request";

type SongRequestRow = {
  id: string;
  requester_name: string;
  title: string;
  artist: string | null;
  youtube_url: string | null;
  note: string | null;
  status: SongRequest["status"];
  song_slug: string | null;
  created_at: string;
};

// request yang dikirim dari HP ini saja
export async function getMyRequests(): Promise<SongRequest[]> {
  await verifyAccess();
  const deviceId = await getDeviceId();
  if (!deviceId) return [];

  const { data, error } = await getSupabase()
    .from("song_requests")
    .select("id, requester_name, title, artist, youtube_url, note, status, song_slug, created_at")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Gagal memuat request:", error.message);
    return [];
  }

  return (data as SongRequestRow[]).map((row) => ({
    id: row.id,
    requesterName: row.requester_name,
    title: row.title,
    artist: row.artist,
    youtubeUrl: row.youtube_url,
    note: row.note,
    status: row.status,
    songSlug: row.song_slug,
    createdAt: row.created_at,
  }));
}
