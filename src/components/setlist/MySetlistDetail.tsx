"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
import OfflineSetlist from "@/components/setlist/OfflineSetlist";
import SetlistFormDialog from "@/components/setlist/SetlistFormDialog";
import SetlistItemsEditor from "@/components/setlist/SetlistItemsEditor";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatSetlistDate } from "@/lib/setlist-utils";
import { useSetlistStore } from "@/store/setlists";
import type { SongSummary } from "@/types/song";

type MySetlistDetailProps = {
  id: string;
  songs: SongSummary[];
};

export default function MySetlistDetail({ id, songs }: MySetlistDetailProps) {
  const router = useRouter();
  const isHydrated = useHydrated();
  const setlist = useSetlistStore((state) => state.setlists.find((item) => item.id === id));
  const updateSetlist = useSetlistStore((state) => state.updateSetlist);
  const setItems = useSetlistStore((state) => state.setItems);
  const deleteSetlist = useSetlistStore((state) => state.deleteSetlist);

  if (!isHydrated) return null;

  if (!setlist) {
    return (
      <div className="rounded-xl bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Setlist tidak ditemukan. Mungkin sudah dihapus, atau dibuat di HP lain.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/setlist">Kembali ke Setlist</Link>
        </Button>
      </div>
    );
  }

  const songCount = setlist.items.filter((item) =>
    songs.some((song) => song.slug === item.slug),
  ).length;

  return (
    <>
      <Link
        href="/setlist"
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Setlist
      </Link>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold break-words">{setlist.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {formatSetlistDate(setlist.date)} · {songCount} lagu
          </p>
        </div>
        <SetlistFormDialog
          title="Ubah setlist"
          submitLabel="Simpan"
          defaultValues={{ name: setlist.name, date: setlist.date }}
          onSubmit={(values) => updateSetlist(setlist.id, values)}
          trigger={
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 bg-card"
              aria-label="Ubah nama dan tanggal"
            >
              <PencilIcon />
            </Button>
          }
        />
      </div>

      <SetlistItemsEditor
        items={setlist.items}
        songs={songs}
        name={setlist.name}
        date={setlist.date}
        onChange={(items) => setItems(setlist.id, items)}
      />
      <OfflineSetlist
        urls={setlist.items.map((item) => `/lagu/${item.slug}?key=${encodeURIComponent(item.key)}`)}
      />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="mt-8 text-destructive hover:text-destructive">
            <Trash2Icon />
            Hapus setlist
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus setlist ini?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{setlist.name}&quot; akan dihapus dari HP ini dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteSetlist(setlist.id);
                router.push("/setlist");
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
