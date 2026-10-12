import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, FilesIcon } from "lucide-react";
import PdfPreviewButton from "@/components/pdf/PdfPreviewButton";
import OfflineSetlist from "@/components/setlist/OfflineSetlist";
import ShareSetlistButton from "@/components/setlist/ShareSetlistButton";
import AuthorInfo from "@/components/shared/AuthorInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEditHistory } from "@/lib/edit-history";
import { getSectionFlow } from "@/lib/chord-sheet";
import { combinedSheetShareSongs } from "@/lib/combined-sheet";
import { formatSetlistDate, type ShareSong } from "@/lib/setlist-utils";
import { getTeamSetlist } from "@/lib/setlists";
import { getSongFlows, getSongs } from "@/lib/songs";

export async function generateMetadata({
  params,
}: PageProps<"/setlist/tim/[id]">): Promise<Metadata> {
  const { id } = await params;
  const setlist = await getTeamSetlist(id);
  return { title: setlist?.name ?? "Setlist tidak ditemukan" };
}

export default async function TeamSetlistPage({ params }: PageProps<"/setlist/tim/[id]">) {
  const { id } = await params;
  const [setlist, songs] = await Promise.all([getTeamSetlist(id), getSongs()]);
  if (!setlist) notFound();
  // urutan bagian lagu library untuk teks share, hanya untuk lagu tanpa aransemen khusus
  const librarySlugs = setlist.items.filter((item) => !item.arrangement).map((item) => item.slug);
  const [edits, songFlows] = await Promise.all([
    getEditHistory("setlist", setlist.id),
    setlist.combinedSheet || librarySlugs.length === 0
      ? ({} as Record<string, string[]>)
      : getSongFlows(librarySlugs),
  ]);

  // lagu yang sudah dihapus dari library dilewati
  const items = setlist.items
    .map((item, index) => ({ ...item, index, song: songs.find((song) => song.slug === item.slug) }))
    .filter((item) => item.song !== undefined);
  // lagu dibuka dari dalam setlist, supaya aransemen khusus dan key setlist yang dipakai
  const songHref = (item: (typeof items)[number]) => `/setlist/tim/${setlist.id}/${item.index + 1}`;
  const combinedHref = `/setlist/tim/${setlist.id}/gabungan`;
  const combinedPdfBase = `/api/pdf?setlist=${setlist.id}`;
  // teks share WhatsApp: ada lembar gabungan berarti mengikuti urutan medley
  const shareSongs: ShareSong[] = setlist.combinedSheet
    ? combinedSheetShareSongs(setlist.combinedSheet, setlist.items[0]?.key ?? null)
    : items.map((item) => ({
        title: item.song?.title ?? item.slug,
        key: item.key,
        note: item.note,
        flow: item.arrangement ? getSectionFlow(item.arrangement) : songFlows[item.slug],
      }));

  return (
    <>
      <Link
        href="/setlist"
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Setlist
      </Link>

      <div>
        <Badge variant="secondary">Setlist tim</Badge>
      </div>
      <h1 className="mt-2 text-2xl font-semibold">{setlist.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {formatSetlistDate(setlist.date)} · {items.length} lagu
      </p>
      <AuthorInfo
        className="mt-4"
        createdAt={setlist.createdAt}
        createdBy={setlist.createdBy}
        updatedAt={setlist.updatedAt}
        updatedBy={setlist.updatedBy}
        edits={edits}
      />

      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {/* semua lagu dalam satu lembar (misalnya medley), disusun admin */}
          {setlist.combinedSheet && (
            <Button asChild>
              <Link href={combinedHref}>
                <FilesIcon />
                Lembar gabungan
              </Link>
            </Button>
          )}
          <PdfPreviewButton
            variant={setlist.combinedSheet ? "outline" : "default"}
            className={setlist.combinedSheet ? "bg-card" : undefined}
            url={`/api/pdf?setlist=${setlist.id}`}
            contents={
              setlist.combinedSheet
                ? [
                    {
                      label: "Lembar gabungan (medley)",
                      url: `${combinedPdfBase}&lembar=gabungan`,
                    },
                    { label: "Per lagu", url: combinedPdfBase },
                  ]
                : undefined
            }
            title={`${setlist.name} · ${items.length} lagu`}
            label="PDF gabungan"
          />
          <ShareSetlistButton
            name={setlist.name}
            date={setlist.date}
            path={`/setlist/tim/${setlist.id}`}
            songs={shareSongs}
          />
        </div>
      )}
      <OfflineSetlist
        urls={[
          `/setlist/tim/${setlist.id}`,
          ...(setlist.combinedSheet ? [combinedHref] : []),
          ...items.map(songHref),
        ]}
      />

      <ol className="mt-6 grid gap-3">
        {items.map((item, index) => (
          <li key={`${item.slug}-${index}`}>
            <Link href={songHref(item)} className="block rounded-xl focus-visible:outline-2">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center font-semibold text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.song?.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{item.song?.artist}</p>
                    {item.arrangement && (
                      <Badge variant="outline" className="mt-1">
                        Aransemen khusus
                      </Badge>
                    )}
                    {item.note && <p className="mt-1 text-sm italic">{item.note}</p>}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    Key {item.key}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
