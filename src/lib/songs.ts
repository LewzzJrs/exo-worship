import "server-only";

import { verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import type { Song, SongSummary } from "@/types/song";

// semua pengambilan data lagu lewat file ini

export type SongRow = {
  slug: string;
  title: string;
  artist: string;
  key: string;
  bpm: number | null;
  time_signature: string | null;
  youtube_url: string | null;
  content: string;
  created_at: string;
  created_by: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

const SUMMARY_COLUMNS =
  "slug, title, artist, key, bpm, time_signature, youtube_url, created_at, created_by, updated_by, updated_at";

type GetSongsOptions = {
  query?: string;
  sort?: "terbaru" | "judul";
};

function toSummary(row: Omit<SongRow, "content">): SongSummary {
  return {
    slug: row.slug,
    title: row.title,
    artist: row.artist,
    key: row.key,
    bpm: row.bpm ?? undefined,
    timeSignature: row.time_signature ?? undefined,
    youtubeUrl: row.youtube_url ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function toSong(row: SongRow): Song {
  return { ...toSummary(row), content: row.content };
}

// tanda % dan _ punya arti khusus di pencarian ilike, jadi di-escape
function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function getSongs({ query, sort = "terbaru" }: GetSongsOptions = {}) {
  await verifyAccess();
  const supabase = getSupabase();
  const keyword = query?.trim();

  // bisa dicari dari judul, artis, atau potongan lirik
  const { data, error } = keyword
    ? await supabase.rpc("search_songs", { keyword: escapeLike(keyword) }).select(SUMMARY_COLUMNS)
    : await supabase.from("songs").select(SUMMARY_COLUMNS);

  if (error) {
    console.error("Gagal memuat lagu:", error.message);
    return [];
  }

  return (data as Omit<SongRow, "content">[])
    .map(toSummary)
    .sort((a, b) =>
      sort === "judul"
        ? a.title.localeCompare(b.title, "id")
        : b.createdAt.localeCompare(a.createdAt),
    );
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  await verifyAccess();

  const { data, error } = await getSupabase()
    .from("songs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("Gagal memuat lagu:", error.message);

  return data ? toSong(data as SongRow) : null;
}

// untuk memastikan slug yang dikirim dari browser memang lagu yang ada
export async function songExists(slug: string) {
  const { count } = await getSupabase()
    .from("songs")
    .select("slug", { count: "exact", head: true })
    .eq("slug", slug);
  return (count ?? 0) > 0;
}
