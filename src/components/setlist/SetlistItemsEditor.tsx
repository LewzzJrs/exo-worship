"use client";

import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, FileDownIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddSongDialog from "@/components/setlist/AddSongDialog";
import { getKeyOptions } from "@/lib/keys";
import { buildPdfUrl } from "@/lib/setlist-utils";
import type { SetlistItem } from "@/types/setlist";
import type { SongSummary } from "@/types/song";

type SetlistItemsEditorProps = {
  items: SetlistItem[];
  songs: SongSummary[];
  // untuk nama file dan halaman depan PDF
  name: string;
  date: string;
  onChange: (items: SetlistItem[]) => void;
};

// daftar lagu di setlist: tambah, ganti key, atur urutan, hapus, dan PDF gabungan
export default function SetlistItemsEditor({
  items,
  songs,
  name,
  date,
  onChange,
}: SetlistItemsEditorProps) {
  // lagu yang sudah dihapus dari library dilewati
  const rows = items
    .map((item, index) => ({ ...item, index, song: songs.find((song) => song.slug === item.slug) }))
    .filter((row) => row.song !== undefined);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <AddSongDialog
          songs={songs}
          addedSlugs={items.map((item) => item.slug)}
          onAdd={(song) => {
            onChange([...items, { slug: song.slug, key: song.key }]);
            toast.success(`${song.title} ditambahkan`);
          }}
        />
        {rows.length > 0 && (
          <Button asChild>
            <a href={buildPdfUrl({ items: rows, name, date })} download>
              <FileDownIcon />
              Download PDF gabungan
            </a>
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl bg-card p-4 text-sm text-muted-foreground">
          Belum ada lagu. Tekan Tambah lagu untuk memilih dari library.
        </p>
      ) : (
        <ol className="mt-6 grid gap-3">
          {rows.map((row, position) => (
            <li key={`${row.slug}-${row.index}`}>
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-5 shrink-0 pt-0.5 text-center font-semibold text-muted-foreground tabular-nums">
                      {position + 1}
                    </span>
                    <Link
                      href={`/lagu/${row.slug}?key=${encodeURIComponent(row.key)}`}
                      className="min-w-0 flex-1 hover:underline"
                    >
                      <p className="truncate font-medium">{row.song?.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{row.song?.artist}</p>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus ${row.song?.title} dari setlist`}
                      onClick={() => onChange(items.filter((_, index) => index !== row.index))}
                    >
                      <XIcon />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 pl-8">
                    <span className="text-sm text-muted-foreground">Key</span>
                    <Select
                      value={row.key}
                      onValueChange={(key) =>
                        onChange(
                          items.map((item, index) =>
                            index === row.index ? { ...item, key } : item,
                          ),
                        )
                      }
                    >
                      <SelectTrigger size="sm" className="w-20" aria-label="Pilih key">
                        <SelectValue>{row.key}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {getKeyOptions(row.song?.key ?? row.key).map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                            {key === row.song?.key && " (asli)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Pindah ke atas"
                        disabled={row.index === 0}
                        onClick={() => move(row.index, row.index - 1)}
                      >
                        <ArrowUpIcon />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Pindah ke bawah"
                        disabled={row.index === items.length - 1}
                        onClick={() => move(row.index, row.index + 1)}
                      >
                        <ArrowDownIcon />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
