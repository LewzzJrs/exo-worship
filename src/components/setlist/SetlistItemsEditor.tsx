"use client";

import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, FilePenLineIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PdfPreviewButton from "@/components/pdf/PdfPreviewButton";
import AddSongDialog from "@/components/setlist/AddSongDialog";
import ShareSetlistButton from "@/components/setlist/ShareSetlistButton";
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
  // link setlist untuk dibagikan; kosong kalau setlist hanya ada di HP
  sharePath?: string;
  // link PDF yang sudah tersimpan (setlist tim, termasuk aransemen khusus)
  pdfHref?: string;
  // tombol aransemen khusus, hanya untuk setlist tim
  onEditArrangement?: (index: number) => void;
  onChange: (items: SetlistItem[]) => void;
};

// daftar lagu di setlist: tambah, ganti key, atur urutan, hapus, dan PDF gabungan
export default function SetlistItemsEditor({
  items,
  songs,
  name,
  date,
  sharePath,
  pdfHref,
  onEditArrangement,
  onChange,
}: SetlistItemsEditorProps) {
  // lagu yang sudah dihapus dari library dilewati
  const rows = items
    .map((item, index) => ({ ...item, index, song: songs.find((song) => song.slug === item.slug) }))
    .filter((row) => row.song !== undefined);

  function update(index: number, change: Partial<SetlistItem>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...change } : item)));
  }

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
          <PdfPreviewButton
            url={pdfHref ?? buildPdfUrl({ items: rows, name, date })}
            title={`${name || "Setlist"} · ${rows.length} lagu`}
            label="PDF gabungan"
          />
        )}
        {rows.length > 0 && (
          <ShareSetlistButton
            name={name}
            date={date}
            path={sharePath}
            songs={rows.map((row) => ({
              title: row.song?.title ?? row.slug,
              key: row.key,
              note: row.note,
            }))}
          />
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
                      {row.arrangement && (
                        <Badge variant="outline" className="mt-1">
                          Aransemen khusus
                        </Badge>
                      )}
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
                    <Select value={row.key} onValueChange={(key) => update(row.index, { key })}>
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
                    {onEditArrangement && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditArrangement(row.index)}
                      >
                        <FilePenLineIcon />
                        Aransemen
                      </Button>
                    )}
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
                  <div className="pl-8">
                    <Input
                      value={row.note ?? ""}
                      maxLength={120}
                      placeholder="Catatan, misalnya: intro 2x, naik ke A di reff terakhir"
                      aria-label={`Catatan untuk ${row.song?.title}`}
                      onChange={(event) =>
                        update(row.index, { note: event.target.value || undefined })
                      }
                      className="h-8 text-sm"
                    />
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
