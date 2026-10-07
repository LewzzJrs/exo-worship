import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, FileDownIcon } from "lucide-react";
import OfflineSetlist from "@/components/setlist/OfflineSetlist";
import ShareSetlistButton from "@/components/setlist/ShareSetlistButton";
import AuthorInfo from "@/components/shared/AuthorInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildPdfUrl, formatSetlistDate } from "@/lib/setlist-utils";
import { getTeamSetlist } from "@/lib/setlists";
import { getSongs } from "@/lib/songs";

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

  // lagu yang sudah dihapus dari library dilewati
  const items = setlist.items
    .map((item) => ({ ...item, song: songs.find((song) => song.slug === item.slug) }))
    .filter((item) => item.song !== undefined);
  const songHref = (item: (typeof items)[number]) =>
    `/lagu/${item.slug}?key=${encodeURIComponent(item.key)}`;

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
      />

      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <a href={buildPdfUrl({ items, name: setlist.name, date: setlist.date })} download>
              <FileDownIcon />
              Download PDF gabungan
            </a>
          </Button>
          <ShareSetlistButton
            name={setlist.name}
            date={setlist.date}
            path={`/setlist/tim/${setlist.id}`}
            songs={items.map((item) => ({
              title: item.song?.title ?? item.slug,
              key: item.key,
              note: item.note,
            }))}
          />
        </div>
      )}
      <OfflineSetlist urls={[`/setlist/tim/${setlist.id}`, ...items.map(songHref)]} />

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
