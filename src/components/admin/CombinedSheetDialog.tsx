"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import CombinedSheet from "@/components/setlist/CombinedSheet";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getSongsForSheet } from "@/lib/actions/admin-setlists";
import { transposeContent } from "@/lib/chord-sheet";
import { buildCombinedSheet } from "@/lib/combined-sheet";
import type { SetlistItem } from "@/types/setlist";
import type { SongSummary } from "@/types/song";

type CombinedSheetDialogProps = {
  // kosong berarti lembar gabungan baru, langsung dibuat dari daftar lagu
  initialText: string | null;
  items: SetlistItem[];
  songs: SongSummary[];
  onClose: () => void;
  onSave: (text: string) => void;
};

// semua lagu setlist (aransemen khusus kalau ada, sudah di key setlist) disambung jadi satu teks
async function generateSheet(items: SetlistItem[], songs: SongSummary[]) {
  const needLibrary = items.filter((item) => !item.arrangement).map((item) => item.slug);
  const library = needLibrary.length > 0 ? await getSongsForSheet(needLibrary) : {};

  return buildCombinedSheet(
    items.flatMap((item) => {
      const title = songs.find((song) => song.slug === item.slug)?.title;
      const song = library[item.slug];
      if (!title) return [];

      const content = item.arrangement
        ? transposeContent(item.arrangement, item.arrangementKey ?? item.key, item.key)
        : song
          ? transposeContent(song.content, song.key, item.key)
          : "";
      return [{ title, key: item.key, note: item.note, content }];
    }),
  );
}

export default function CombinedSheetDialog({
  initialText,
  items,
  songs,
  onClose,
  onSave,
}: CombinedSheetDialogProps) {
  const [text, setText] = useState(initialText ?? "");
  const [isGenerating, setIsGenerating] = useState(initialText === null);
  const fallbackKey = items[0]?.key ?? null;

  const regenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      setText(await generateSheet(items, songs));
    } catch (error) {
      console.error("Gagal membuat lembar gabungan:", error);
      toast.error("Gagal memuat lagu dari library, coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  }, [items, songs]);

  // lembar baru langsung diisi dari daftar lagu
  useEffect(() => {
    if (initialText !== null) return;
    let cancelled = false;
    generateSheet(items, songs)
      .then((sheet) => !cancelled && setText(sheet))
      .catch(() => !cancelled && toast.error("Gagal memuat lagu dari library, coba lagi."))
      .finally(() => !cancelled && setIsGenerating(false));
    return () => {
      cancelled = true;
    };
  }, [initialText, items, songs]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Lembar gabungan</DialogTitle>
          <DialogDescription>
            Semua lagu di setlist ini dalam satu lembar. Bagian lagu bisa dipotong, dipindah, atau
            digabung untuk medley. Lagu di library dan aransemen per lagu tidak ikut berubah.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
          <li>
            Setiap lagu diawali baris judul, contoh{" "}
            <code className="text-foreground">== KumilikMu | Key G ==</code>
          </li>
          <li>
            Pindah key di tengah medley: tulis <code className="text-foreground">== Key A ==</code>{" "}
            lalu lanjutkan chord di key baru
          </li>
          <li>Selebihnya sama seperti editor lagu: [Verse], baris chord, not angka, dan lirik</li>
        </ul>

        {isGenerating ? (
          <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Menyusun lagu dari setlist...
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              wrap="off"
              spellCheck={false}
              aria-label="Isi lembar gabungan"
              className="min-h-[55vh] font-mono text-sm leading-6"
            />
            <Card className="max-h-[65vh] overflow-y-auto">
              <CardContent>
                {text.trim() ? (
                  <CombinedSheet content={text} fallbackKey={fallbackKey} />
                ) : (
                  <p className="text-sm text-muted-foreground">Preview muncul di sini.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" disabled={isGenerating}>
                <RefreshCwIcon />
                Buat ulang dari daftar lagu
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Buat ulang lembar gabungan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isi editor diganti dengan semua lagu sesuai daftar, key, dan aransemen saat ini.
                  Perubahan medley yang sudah ditulis akan hilang.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={regenerate}>Buat ulang</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="button"
              disabled={isGenerating || !text.trim()}
              onClick={() => onSave(text.replace(/\s+$/, ""))}
            >
              Pakai lembar ini
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
