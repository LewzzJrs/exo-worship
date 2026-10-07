import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import SongEditor from "@/components/admin/SongEditor";
import { getSongBySlug } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Edit Lagu",
};

export default async function EditSongPage({ params }: PageProps<"/admin/lagu/[slug]">) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) notFound();

  return (
    <>
      <Link
        href="/admin/lagu"
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Lagu
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Edit: {song.title}</h1>
      <SongEditor song={song} />
    </>
  );
}
