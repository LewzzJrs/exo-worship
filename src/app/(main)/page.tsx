import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import SongCard from "@/components/song/SongCard";
import { formatMonth, getMonthlyRecommendedSongs } from "@/lib/recommendations";
import { getSongs } from "@/lib/songs";

export default async function HomePage() {
  const [recommendation, allSongs] = await Promise.all([
    getMonthlyRecommendedSongs(),
    getSongs({ sort: "terbaru" }),
  ]);
  const latestSongs = allSongs.slice(0, 5);

  return (
    <>
      <h1 className="text-2xl font-semibold">Beranda</h1>
      <p className="mt-1 text-sm text-muted-foreground">Library chord tim Exo Worship.</p>

      <section className="mt-6">
        <div className="mb-3">
          <h2 className="text-base font-semibold">Rekomendasi bulan ini</h2>
          <p className="text-xs text-muted-foreground">{formatMonth(recommendation.month)}</p>
        </div>
        {recommendation.songs.length > 0 ? (
          <ol className="grid gap-3">
            {recommendation.songs.map((song, index) => (
              <li key={song.slug} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-lg font-semibold text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <SongCard song={song} />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground">
            Belum ada lagu rekomendasi untuk bulan ini.
          </p>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Lagu terbaru</h2>
          <Link
            href="/library"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Lihat semua
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>
        <ul className="grid gap-3">
          {latestSongs.map((song) => (
            <li key={song.slug}>
              <SongCard song={song} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
