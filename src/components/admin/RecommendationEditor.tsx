"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { LeaveConfirmDialog } from "@/components/admin/UnsavedChanges";
import AddSongDialog from "@/components/setlist/AddSongDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLeaveConfirmation } from "@/hooks/use-leave-confirmation";
import { saveRecommendations } from "@/lib/actions/admin-recommendations";
import { MAX_RECOMMENDATIONS } from "@/lib/constants";
import type { SongSummary } from "@/types/song";

type RecommendationEditorProps = {
  month: string;
  initialSlugs: string[];
  songs: SongSummary[];
};

export default function RecommendationEditor({
  month,
  initialSlugs,
  songs,
}: RecommendationEditorProps) {
  const router = useRouter();
  const [slugs, setSlugs] = useState(initialSlugs);
  const [savedSlugs, setSavedSlugs] = useState(initialSlugs);
  const [isSaving, startSaving] = useTransition();
  const hasChanges = slugs.join("|") !== savedSlugs.join("|");
  const leave = useLeaveConfirmation(hasChanges && !isSaving);

  // lagu yang sudah dihapus dari library dilewati
  const rows = slugs
    .map((slug, index) => ({ slug, index, song: songs.find((song) => song.slug === slug) }))
    .filter((row) => row.song !== undefined);

  function move(from: number, to: number) {
    if (to < 0 || to >= slugs.length) return;
    const next = [...slugs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSlugs(next);
  }

  function handleSave() {
    startSaving(async () => {
      const result = await saveRecommendations(month, slugs);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSavedSlugs(slugs);
      toast.success("Rekomendasi disimpan");
      router.refresh();
    });
  }

  return (
    <>
      <LeaveConfirmDialog open={!!leave.pendingHref} onStay={leave.stay} onLeave={leave.leave} />

      <div className="flex flex-wrap items-center gap-2">
        {slugs.length < MAX_RECOMMENDATIONS ? (
          <AddSongDialog
            songs={songs}
            addedSlugs={slugs}
            onAdd={(song) => {
              if (slugs.length >= MAX_RECOMMENDATIONS) return;
              setSlugs([...slugs, song.slug]);
              toast.success(`${song.title} ditambahkan`);
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sudah {MAX_RECOMMENDATIONS} lagu (batas maksimal).
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl bg-card p-4 text-sm text-muted-foreground">
          Belum ada lagu rekomendasi untuk bulan ini.
        </p>
      ) : (
        <ol className="mt-6 grid gap-3">
          {rows.map((row, position) => (
            <li key={row.slug}>
              <Card>
                <CardContent className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center font-semibold text-muted-foreground tabular-nums">
                    {position + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{row.song?.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{row.song?.artist}</p>
                  </div>
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
                    disabled={row.index === slugs.length - 1}
                    onClick={() => move(row.index, row.index + 1)}
                  >
                    <ArrowDownIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Hapus ${row.song?.title} dari rekomendasi`}
                    onClick={() => setSlugs(slugs.filter((slug) => slug !== row.slug))}
                  >
                    <XIcon />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-5">
        <Button size="lg" disabled={!hasChanges || isSaving} onClick={handleSave}>
          {isSaving ? "Menyimpan..." : "Simpan rekomendasi"}
        </Button>
        {hasChanges && <span className="text-xs text-muted-foreground">Belum disimpan</span>}
      </div>
    </>
  );
}
