"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SongSummary } from "@/types/song";

type AddSongDialogProps = {
  songs: SongSummary[];
  addedSlugs: string[];
  onAdd: (song: SongSummary) => void;
};

export default function AddSongDialog({ songs, addedSlugs, onAdd }: AddSongDialogProps) {
  const [query, setQuery] = useState("");
  const keyword = query.trim().toLowerCase();
  const results = keyword
    ? songs.filter((song) => `${song.title} ${song.artist}`.toLowerCase().includes(keyword))
    : songs;

  return (
    <Dialog onOpenChange={(open) => open && setQuery("")}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-card">
          <PlusIcon />
          Tambah lagu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah lagu</DialogTitle>
          <DialogDescription>
            Lagu masuk dengan key asli, bisa diganti setelahnya.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari judul atau artis"
            aria-label="Cari lagu"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <ul className="-mx-2 max-h-80 overflow-y-auto">
          {results.map((song) => {
            const isAdded = addedSlugs.includes(song.slug);

            return (
              <li key={song.slug}>
                <button
                  type="button"
                  disabled={isAdded}
                  onClick={() => onAdd(song)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-muted disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{song.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {song.artist} · Key {song.key}
                    </span>
                  </span>
                  {isAdded ? (
                    <CheckIcon className="size-4 shrink-0" aria-label="Sudah ada" />
                  ) : (
                    <PlusIcon className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="px-2 py-4 text-center text-sm text-muted-foreground">
              Lagu tidak ditemukan.
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
