import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import PdfPreviewButton from "@/components/pdf/PdfPreviewButton";
import CombinedSheetViewer from "@/components/setlist/CombinedSheetViewer";
import { Badge } from "@/components/ui/badge";
import { formatSetlistDate } from "@/lib/setlist-utils";
import { getTeamSetlist } from "@/lib/setlists";

export async function generateMetadata({
  params,
}: PageProps<"/setlist/tim/[id]/gabungan">): Promise<Metadata> {
  const { id } = await params;
  const setlist = await getTeamSetlist(id);
  return { title: setlist ? `Lembar gabungan ${setlist.name}` : "Setlist tidak ditemukan" };
}

// semua lagu setlist tim dalam satu lembar (misalnya medley), disusun admin
export default async function CombinedSheetPage({
  params,
}: PageProps<"/setlist/tim/[id]/gabungan">) {
  const { id } = await params;
  const setlist = await getTeamSetlist(id);
  if (!setlist?.combinedSheet) notFound();

  return (
    <>
      <Link
        href={`/setlist/tim/${setlist.id}`}
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {setlist.name}
      </Link>

      <div>
        <Badge variant="secondary">Lembar gabungan</Badge>
      </div>
      <h1 className="mt-2 text-2xl font-semibold">{setlist.name}</h1>
      <p className="mt-1 text-muted-foreground">{formatSetlistDate(setlist.date)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <PdfPreviewButton
          url={`/api/pdf?setlist=${setlist.id}&lembar=gabungan`}
          title={`${setlist.name} · lembar gabungan`}
          variant="outline"
          className="bg-card"
        />
      </div>

      <div className="mt-4">
        <CombinedSheetViewer
          content={setlist.combinedSheet}
          fallbackKey={setlist.items[0]?.key ?? null}
        />
      </div>
    </>
  );
}
