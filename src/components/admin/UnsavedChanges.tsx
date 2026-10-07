"use client";

import { HistoryIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const timeFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDraftTime(savedAt: string) {
  return timeFormat.format(new Date(savedAt));
}

// pemberitahuan ada draft lama yang belum disimpan
export function DraftBanner({
  savedAt,
  onRestore,
  onDiscard,
}: {
  savedAt: string;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
      <HistoryIcon className="size-5 shrink-0" />
      <p className="min-w-0 flex-1 text-sm">
        Ada draft yang belum disimpan dari <strong>{formatDraftTime(savedAt)}</strong>.
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={onRestore}>
          Lanjutkan draft
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
          Buang
        </Button>
      </div>
    </div>
  );
}

// konfirmasi saat mau keluar dari halaman edit yang belum disimpan
export function LeaveConfirmDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onStay()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar tanpa menyimpan?</AlertDialogTitle>
          <AlertDialogDescription>
            Perubahan belum disimpan. Draft-nya tetap tersimpan di perangkat ini, jadi bisa
            dilanjutkan nanti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Tetap di sini</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onLeave}>
            Keluar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
