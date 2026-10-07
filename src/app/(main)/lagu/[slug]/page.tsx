import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import AuthorInfo from "@/components/shared/AuthorInfo";
import { Badge } from "@/components/ui/badge";
import AddToSetlistDialog from "@/components/song/AddToSetlistDialog";
import LikeButton from "@/components/song/LikeButton";
import SaveButton from "@/components/song/SaveButton";
import SongPdfButton from "@/components/song/SongPdfButton";
import SongViewer from "@/components/song/SongViewer";
import ViewTracker from "@/components/song/ViewTracker";
import YoutubePlayer from "@/components/song/YoutubePlayer";
import { normalizeKey } from "@/lib/keys";
import { getSongBySlug } from "@/lib/songs";
import { getLikeSummary } from "@/lib/stats";
import { getYoutubeId } from "@/lib/youtube";

export async function generateMetadata({ params }: PageProps<"/lagu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  return { title: song ? `${song.title} - ${song.artist}` : "Lagu tidak ditemukan" };
}

export default async function SongPage({ params, searchParams }: PageProps<"/lagu/[slug]">) {
  const [{ slug }, { key }] = await Promise.all([params, searchParams]);
  const song = await getSongBySlug(slug);
  if (!song) notFound();

  const initialKey = normalizeKey(typeof key === "string" ? key : undefined, song.key);
  const videoId = getYoutubeId(song.youtubeUrl);
  const likeSummary = await getLikeSummary(song.slug);

  return (
    <>
      <Link
        href="/library"
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Library
      </Link>

      <h1 className="text-2xl font-semibold">{song.title}</h1>
      <p className="mt-1 text-muted-foreground">{song.artist}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline">Key asli {song.key}</Badge>
        {song.bpm && <Badge variant="outline">{song.bpm} BPM</Badge>}
        {song.timeSignature && <Badge variant="outline">{song.timeSignature}</Badge>}
      </div>
      <AuthorInfo
        className="mt-4"
        createdAt={song.createdAt}
        createdBy={song.createdBy}
        updatedAt={song.updatedAt}
        updatedBy={song.updatedBy}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <LikeButton slug={song.slug} initial={likeSummary} />
        <SaveButton slug={song.slug} />
        <AddToSetlistDialog slug={song.slug} title={song.title} originalKey={song.key} />
        <SongPdfButton slug={song.slug} originalKey={song.key} />
      </div>
      <ViewTracker slug={song.slug} />

      {videoId && (
        <div className="mt-5">
          <YoutubePlayer videoId={videoId} title={song.title} />
        </div>
      )}

      <div className="mt-6">
        <SongViewer content={song.content} originalKey={song.key} initialKey={initialKey} />
      </div>
    </>
  );
}
