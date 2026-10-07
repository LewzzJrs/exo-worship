import type { Metadata } from "next";
import Link from "next/link";
import SearchInput from "@/components/library/SearchInput";
import SongCard from "@/components/song/SongCard";
import { getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Library",
};

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const songs = await getSongs({ query, sort: "judul" });

  return (
    <>
      <h1 className="text-2xl font-semibold">Library</h1>
      <p className="mt-1 text-sm text-muted-foreground">Semua lagu tim, urut sesuai judul.</p>

      <div className="mt-5">
        <SearchInput defaultValue={query} />
      </div>

      <p className="mt-4 mb-3 text-sm text-muted-foreground" aria-live="polite">
        {query ? `${songs.length} lagu cocok dengan "${query}"` : `${songs.length} lagu`}
      </p>

      {songs.length > 0 ? (
        <ul className="grid gap-3">
          {songs.map((song) => (
            <li key={song.slug}>
              <SongCard song={song} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground">
          Lagu tidak ditemukan. Coba kata lain, atau{" "}
          <Link
            href="/request"
            className="font-medium text-foreground underline underline-offset-4"
          >
            kirim request lagu
          </Link>
          .
        </p>
      )}
    </>
  );
}
