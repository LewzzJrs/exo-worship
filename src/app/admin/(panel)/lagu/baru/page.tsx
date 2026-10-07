import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import SongEditor from "@/components/admin/SongEditor";
import { getRequestById } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Lagu Baru",
};

export default async function NewSongPage({ searchParams }: PageProps<"/admin/lagu/baru">) {
  const { request: requestId } = await searchParams;
  const request = typeof requestId === "string" ? await getRequestById(requestId) : null;

  return (
    <>
      <Link
        href="/admin/lagu"
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Lagu
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">Lagu baru</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {request
          ? `Dari request "${request.title}". Setelah disimpan, request otomatis ditandai selesai.`
          : "Isi manual, atau impor dari file dan link Google."}
      </p>
      <SongEditor
        fromRequest={
          request
            ? {
                id: request.id,
                title: request.title,
                artist: request.artist ?? "",
                youtubeUrl: request.youtube_url ?? "",
              }
            : undefined
        }
      />
    </>
  );
}
