import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, LibraryBigIcon, StickyNoteIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SongViewer from "@/components/song/SongViewer";
import YoutubePlayer from "@/components/song/YoutubePlayer";
import { normalizeKey } from "@/lib/keys";
import { getTeamSetlist } from "@/lib/setlists";
import { getSongBySlug, getSongs } from "@/lib/songs";
import { getYoutubeId } from "@/lib/youtube";

// lagu ke-N di setlist tim: memakai key setlist dan aransemen khusus kalau ada

async function loadEntry(id: string, urutan: string) {
  const setlist = await getTeamSetlist(id);
  const index = Number(urutan) - 1;
  if (!setlist || !Number.isInteger(index) || index < 0 || index >= setlist.items.length) {
    return null;
  }
  const item = setlist.items[index];
  const song = await getSongBySlug(item.slug);
  return song ? { setlist, item, index, song } : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/setlist/tim/[id]/[urutan]">): Promise<Metadata> {
  const { id, urutan } = await params;
  const entry = await loadEntry(id, urutan);
  return { title: entry ? `${entry.song.title} · ${entry.setlist.name}` : "Lagu tidak ditemukan" };
}

export default async function SetlistSongPage({
  params,
  searchParams,
}: PageProps<"/setlist/tim/[id]/[urutan]">) {
  const [{ id, urutan }, { key }] = await Promise.all([params, searchParams]);
  const [entry, songs] = await Promise.all([loadEntry(id, urutan), getSongs()]);
  if (!entry) notFound();

  const { setlist, item, index, song } = entry;
  const content = item.arrangement ?? song.content;
  // key tempat aransemen ditulis, atau key asli lagu kalau memakai versi library
  const writtenKey = item.arrangement ? (item.arrangementKey ?? item.key) : song.key;
  const initialKey = normalizeKey(typeof key === "string" ? key : item.key, writtenKey);
  const videoId = getYoutubeId(song.youtubeUrl);

  // lagu sebelum dan sesudahnya (lagu yang sudah dihapus dari library dilewati)
  const available = setlist.items
    .map((setlistItem, itemIndex) => ({
      itemIndex,
      title: songs.find((librarySong) => librarySong.slug === setlistItem.slug)?.title,
    }))
    .filter((entry) => entry.title !== undefined);
  const position = available.findIndex((entry) => entry.itemIndex === index);
  const previous = available[position - 1];
  const next = available[position + 1];

  return (
    <>
      <Link
        href={`/setlist/tim/${setlist.id}`}
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {setlist.name}
      </Link>

      <p className="text-sm text-muted-foreground">
        Lagu {position + 1} dari {available.length}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{song.title}</h1>
      <p className="mt-1 text-muted-foreground">{song.artist}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary">Key setlist {item.key}</Badge>
        {item.arrangement && <Badge>Aransemen khusus setlist ini</Badge>}
        {song.bpm && <Badge variant="outline">{song.bpm} BPM</Badge>}
        {song.timeSignature && <Badge variant="outline">{song.timeSignature}</Badge>}
      </div>

      {item.note && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border bg-card p-3 text-sm">
          <StickyNoteIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {item.note}
        </p>
      )}

      <div className="mt-4">
        <Button asChild variant="outline" size="sm" className="bg-card">
          <Link href={`/lagu/${song.slug}`}>
            <LibraryBigIcon />
            Lihat versi library
          </Link>
        </Button>
      </div>

      {videoId && (
        <div className="mt-5">
          <YoutubePlayer videoId={videoId} title={song.title} />
        </div>
      )}

      <div className="mt-6">
        <SongViewer content={content} originalKey={writtenKey} initialKey={initialKey} />
      </div>

      <nav className="mt-8 grid grid-cols-2 gap-3">
        {previous ? (
          <Link
            href={`/setlist/tim/${setlist.id}/${previous.itemIndex + 1}`}
            className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm hover:shadow-md"
          >
            <ChevronLeftIcon className="size-4 shrink-0" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Sebelumnya</span>
              <span className="block truncate font-medium">{previous.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/setlist/tim/${setlist.id}/${next.itemIndex + 1}`}
            className="flex items-center justify-end gap-2 rounded-xl border bg-card p-3 text-right text-sm hover:shadow-md"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Berikutnya</span>
              <span className="block truncate font-medium">{next.title}</span>
            </span>
            <ChevronRightIcon className="size-4 shrink-0" />
          </Link>
        )}
      </nav>
    </>
  );
}
