"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLinkIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteRequest, updateRequest } from "@/lib/actions/admin-requests";
import type { RequestStatus, SongRequest } from "@/types/request";
import type { SongSummary } from "@/types/song";

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "menunggu", label: "Menunggu" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "ditolak", label: "Ditolak" },
];

const NO_SONG = "tanpa-lagu";

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

type AdminRequestCardProps = {
  request: SongRequest;
  songs: SongSummary[];
};

export default function AdminRequestCard({ request, songs }: AdminRequestCardProps) {
  const [status, setStatus] = useState(request.status);
  const [songSlug, setSongSlug] = useState(request.songSlug);
  const [isPending, startTransition] = useTransition();
  const isChanged = status !== request.status || songSlug !== request.songSlug;

  function handleSave() {
    startTransition(async () => {
      const result = await updateRequest(request.id, { status, songSlug });
      if ("error" in result) toast.error(result.error);
      else toast.success("Status request disimpan");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRequest(request.id);
      if ("error" in result) toast.error(result.error);
      else toast.success("Request dihapus");
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{request.title}</p>
          {request.artist && <p className="text-sm text-muted-foreground">{request.artist}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {request.requesterName} · {dateFormat.format(new Date(request.createdAt))}
          </p>
        </div>

        {request.note && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
            {request.note}
          </p>
        )}
        {request.youtubeUrl && (
          <a
            href={request.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm underline underline-offset-4"
          >
            <ExternalLinkIcon className="size-3.5" />
            Link YouTube
          </a>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(value) => setStatus(value as RequestStatus)}>
            <SelectTrigger className="w-32" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {status === "selesai" && (
            <Select
              value={songSlug ?? NO_SONG}
              onValueChange={(value) => setSongSlug(value === NO_SONG ? null : value)}
            >
              <SelectTrigger className="w-56" aria-label="Lagu hasil request">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SONG}>Tanpa link lagu</SelectItem>
                {songs.map((song) => (
                  <SelectItem key={song.slug} value={song.slug}>
                    {song.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button size="sm" disabled={!isChanged || isPending} onClick={handleSave}>
            Simpan
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-3">
          {request.status !== "selesai" && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/lagu/baru?request=${request.id}`}>
                <PlusIcon />
                Buat lagunya
              </Link>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                disabled={isPending}
              >
                <Trash2Icon />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus request ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Request &quot;{request.title}&quot; dari {request.requesterName} akan dihapus.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
