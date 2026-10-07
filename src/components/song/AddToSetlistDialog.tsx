"use client";

import { useState } from "react";
import { ListPlusIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SetlistFormDialog from "@/components/setlist/SetlistFormDialog";
import { useHydrated } from "@/hooks/use-hydrated";
import { getCurrentKey } from "@/lib/current-key";
import { formatSetlistDate } from "@/lib/setlist-utils";
import { useSetlistStore } from "@/store/setlists";

type AddToSetlistDialogProps = {
  slug: string;
  title: string;
  originalKey: string;
};

export default function AddToSetlistDialog({ slug, title, originalKey }: AddToSetlistDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState(originalKey);
  const isHydrated = useHydrated();
  const setlists = useSetlistStore((state) => state.setlists);
  const createSetlist = useSetlistStore((state) => state.createSetlist);
  const addSong = useSetlistStore((state) => state.addSong);

  function handleOpenChange(open: boolean) {
    // lagu masuk ke setlist dengan key yang sedang dipilih
    if (open) setKey(getCurrentKey(originalKey));
    setIsOpen(open);
  }

  function handleAdd(id: string, name: string) {
    if (addSong(id, slug, key)) {
      toast.success(`Ditambahkan ke ${name} (key ${key})`);
      setIsOpen(false);
    } else {
      toast.info(`${title} sudah ada di ${name}`);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-card" disabled={!isHydrated}>
          <ListPlusIcon />
          Tambah ke setlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah ke setlist</DialogTitle>
          <DialogDescription>
            {title} akan masuk dengan key {key}.
          </DialogDescription>
        </DialogHeader>

        {setlists.length > 0 ? (
          <ul className="-mx-2 max-h-72 overflow-y-auto">
            {setlists.map((setlist) => (
              <li key={setlist.id}>
                <button
                  type="button"
                  onClick={() => handleAdd(setlist.id, setlist.name)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{setlist.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatSetlistDate(setlist.date)} · {setlist.items.length} lagu
                    </span>
                  </span>
                  <PlusIcon className="size-4 shrink-0" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Kamu belum punya setlist pribadi.</p>
        )}

        <SetlistFormDialog
          title="Setlist baru"
          submitLabel="Buat dan tambahkan lagu"
          trigger={
            <Button variant="outline">
              <PlusIcon />
              Buat setlist baru
            </Button>
          }
          onSubmit={(values) => {
            const id = createSetlist(values.name, values.date);
            handleAdd(id, values.name);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
