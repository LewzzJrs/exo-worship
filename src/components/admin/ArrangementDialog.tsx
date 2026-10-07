"use client";

import { useEffect, useState } from "react";
import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import ChordSheet from "@/components/song/ChordSheet";
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
import { getSongForArrangement } from "@/lib/actions/admin-setlists";
import { transposeContent } from "@/lib/chord-sheet";
import type { SetlistItem } from "@/types/setlist";

type ArrangementDialogProps = {
  item: SetlistItem;
  songTitle: string;
  onClose: () => void;
  onSave: (arrangement: string, arrangementKey: string) => void;
  onReset: () => void;
};

// editor aransemen khusus satu lagu di setlist tim; lagu di library tidak ikut berubah.
// dipasang ulang setiap kali dibuka, jadi isi awalnya selalu sesuai lagu yang dipilih
export default function ArrangementDialog({
  item,
  songTitle,
  onClose,
  onSave,
  onReset,
}: ArrangementDialogProps) {
  const hasArrangement = !!item.arrangement;
  // sudah punya aransemen: lanjutkan dari situ; belum: dimuat dari library di bawah
  const [text, setText] = useState(item.arrangement ?? "");
  const [writtenKey, setWrittenKey] = useState(item.arrangementKey ?? item.key);
  const [isLoading, setIsLoading] = useState(!hasArrangement);

  useEffect(() => {
    if (hasArrangement) return;
    let cancelled = false;

    // mulai dari versi library, langsung ditulis di key setlist
    getSongForArrangement(item.slug).then((song) => {
      if (cancelled) return;
      if (!song) {
        toast.error("Lagu tidak ditemukan di library.");
        onClose();
        return;
      }
      setText(transposeContent(song.content, song.key, item.key));
      setWrittenKey(item.key);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [hasArrangement, item.slug, item.key, onClose]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Aransemen: {songTitle}</DialogTitle>
          <DialogDescription>
            Hanya berlaku di setlist ini, lagu di library tidak berubah. Chord ditulis dalam key{" "}
            <strong>{writtenKey}</strong>.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat lagu dari library...
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              wrap="off"
              spellCheck={false}
              aria-label="Chord dan lirik aransemen"
              className="min-h-[50vh] font-mono text-sm leading-6"
            />
            <Card className="max-h-[60vh] overflow-y-auto">
              <CardContent>
                {text.trim() ? (
                  <ChordSheet content={text} originalKey={writtenKey} currentKey={writtenKey} />
                ) : (
                  <p className="text-sm text-muted-foreground">Preview muncul di sini.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {hasArrangement ? (
            <Button type="button" variant="ghost" onClick={onReset}>
              <RotateCcwIcon />
              Kembalikan ke versi library
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="button"
              disabled={isLoading || !text.trim()}
              onClick={() => onSave(text.replace(/\s+$/, ""), writtenKey)}
            >
              Pakai aransemen ini
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
