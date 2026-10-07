"use client";

import Link from "next/link";
import SongCard from "@/components/song/SongCard";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useLibraryStore } from "@/store/library";
import type { SongSummary } from "@/types/song";

export default function SavedSongList({ songs }: { songs: SongSummary[] }) {
  const isHydrated = useHydrated();
  const savedSlugs = useLibraryStore((state) => state.savedSlugs);

  if (!isHydrated) return null;

  // urut sesuai waktu disimpan, lagu yang sudah dihapus admin dilewati
  const savedSongs = savedSlugs
    .map((slug) => songs.find((song) => song.slug === slug))
    .filter((song) => song !== undefined);

  if (savedSongs.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada lagu tersimpan. Buka lagu, lalu tekan tombol Simpan.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/library">Buka Library</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">{savedSongs.length} lagu tersimpan</p>
      <ul className="grid gap-3">
        {savedSongs.map((song) => (
          <li key={song.slug}>
            <SongCard song={song} />
          </li>
        ))}
      </ul>
    </>
  );
}
