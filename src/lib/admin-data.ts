import "server-only";

import { verifyAdmin } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import type { RequestStatus, SongRequest } from "@/types/request";

type SongRequestRow = {
  id: string;
  requester_name: string;
  title: string;
  artist: string | null;
  youtube_url: string | null;
  note: string | null;
  status: RequestStatus;
  song_slug: string | null;
  created_at: string;
};

export async function getAllRequests(status?: RequestStatus): Promise<SongRequest[]> {
  await verifyAdmin();

  let query = getSupabase()
    .from("song_requests")
    .select("id, requester_name, title, artist, youtube_url, note, status, song_slug, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
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

export async function getRequestById(id: string) {
  await verifyAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const { data } = await getSupabase()
    .from("song_requests")
    .select("id, title, artist, youtube_url")
    .eq("id", id)
    .maybeSingle();
  return data as {
    id: string;
    title: string;
    artist: string | null;
    youtube_url: string | null;
  } | null;
}

async function countRows(table: string, filter?: [string, string]) {
  let query = getSupabase().from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter[0], filter[1]);
  const { count } = await query;
  return count ?? 0;
}

export async function getDashboardCounts() {
  await verifyAdmin();

  const [songs, teamSetlists, waitingRequests] = await Promise.all([
    countRows("songs"),
    countRows("team_setlists"),
    countRows("song_requests", ["status", "menunggu"]),
  ]);
  return { songs, teamSetlists, waitingRequests };
}
