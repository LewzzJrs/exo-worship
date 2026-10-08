"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLinkIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import ImportPanel from "@/components/admin/ImportPanel";
import {
  DraftBanner,
  LeaveConfirmDialog,
  formatDraftTime,
} from "@/components/admin/UnsavedChanges";
import ChordSheet from "@/components/song/ChordSheet";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { clearDraft, useDraftAutosave, useInitialDraft } from "@/hooks/use-draft";
import { useLeaveConfirmation } from "@/hooks/use-leave-confirmation";
import { deleteSong, saveSong } from "@/lib/actions/admin-songs";
import type { ImportResult } from "@/lib/import/normalize";
import { ALL_KEYS } from "@/lib/keys";
import { songSchema, type SongValues } from "@/lib/validations/song";
import type { Song } from "@/types/song";

type SongEditorProps = {
  // kosong berarti membuat lagu baru
  song?: Song;
  // isian awal kalau lagu dibuat dari request anggota
  fromRequest?: { id: string; title: string; artist: string; youtubeUrl: string };
};

const CONTENT_EXAMPLE = `[Verse 1]
G               D/F#
Baris lirik pertama
Em              C
Baris lirik kedua

[Chorus]
C       D       G
3 . 2 1 2 . 1 7 1
Lirik chorus di sini`;

export default function SongEditor({ song, fromRequest }: SongEditorProps) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const form = useForm<SongValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: song?.title ?? fromRequest?.title ?? "",
      artist: song?.artist ?? fromRequest?.artist ?? "",
      key: song?.key ?? "G",
      bpm: song?.bpm ? String(song.bpm) : "",
      timeSignature: song?.timeSignature ?? "4/4",
      youtubeUrl: song?.youtubeUrl ?? fromRequest?.youtubeUrl ?? "",
      content: song?.content ?? "",
    },
  });
  const { errors, isDirty, defaultValues } = form.formState;
  const [content, songKey] = useWatch({ control: form.control, name: ["content", "key"] });
  const allValues = useWatch({ control: form.control });

  // draft per lagu (atau per request / lagu baru), tersimpan di perangkat ini
  const draftKey = `lagu:${song?.slug ?? (fromRequest ? `request-${fromRequest.id}` : "baru")}`;
  const initialDraft = useInitialDraft<SongValues>(draftKey);
  const [isDraftHandled, setIsDraftHandled] = useState(false);
  const lastDraftAt = useDraftAutosave(draftKey, allValues, isDirty);
  const leave = useLeaveConfirmation(isDirty && !isSaving && !isDeleting);
  const showDraftBanner =
    initialDraft !== null &&
    !isDraftHandled &&
    JSON.stringify(initialDraft.values) !== JSON.stringify(defaultValues);

  function restoreDraft() {
    if (!initialDraft) return;
    // nilai awal tetap dari database, jadi form langsung dianggap ada perubahan
    form.reset(initialDraft.values, { keepDefaultValues: true });
    setIsDraftHandled(true);
  }

  function discardDraft() {
    clearDraft(draftKey);
    setIsDraftHandled(true);
  }

  function handleImported(result: ImportResult) {
    const current = form.getValues("content").trim();
    if (current && !window.confirm("Ganti isi chord dan lirik dengan hasil impor?")) return;

    const options = { shouldDirty: true, shouldValidate: true };
    form.setValue("content", result.content, options);
    if (result.title && !form.getValues("title")) form.setValue("title", result.title, options);
    if (result.artist && !form.getValues("artist")) form.setValue("artist", result.artist, options);
    if (result.key) form.setValue("key", result.key, options);
  }

  function onSubmit(values: SongValues) {
    startSaving(async () => {
      const result = await saveSong(values, { slug: song?.slug, requestId: fromRequest?.id });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      // sudah tersimpan: draft dibuang dan form dianggap bersih lagi
      clearDraft(draftKey);
      form.reset(values);
      toast.success(song ? "Perubahan disimpan" : "Lagu ditambahkan");
      if (song) router.refresh();
      else router.push("/admin/lagu");
    });
  }

  function handleDelete() {
    if (!song) return;
    startDeleting(async () => {
      const result = await deleteSong(song.slug);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      clearDraft(draftKey);
      toast.success("Lagu dihapus");
      router.push("/admin/lagu");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
      {showDraftBanner && (
        <DraftBanner
          savedAt={initialDraft.savedAt}
          onRestore={restoreDraft}
          onDiscard={discardDraft}
        />
      )}
      <LeaveConfirmDialog open={!!leave.pendingHref} onStay={leave.stay} onLeave={leave.leave} />
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Judul</FieldLabel>
          <Input id="title" className="bg-card" {...form.register("title")} />
          <FieldError errors={[errors.title]} />
        </Field>
        <Field data-invalid={!!errors.artist}>
          <FieldLabel htmlFor="artist">Artis</FieldLabel>
          <Input
            id="artist"
            placeholder="Contoh: JPCC Worship"
            className="bg-card"
            {...form.register("artist")}
          />
          <FieldError errors={[errors.artist]} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field data-invalid={!!errors.key}>
            <FieldLabel htmlFor="key">Key asli</FieldLabel>
            <Select
              value={songKey}
              onValueChange={(key) =>
                form.setValue("key", key, { shouldDirty: true, shouldValidate: true })
              }
            >
              <SelectTrigger id="key" className="w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.key]} />
          </Field>
          <Field data-invalid={!!errors.bpm}>
            <FieldLabel htmlFor="bpm">BPM</FieldLabel>
            <Input id="bpm" inputMode="numeric" className="bg-card" {...form.register("bpm")} />
            <FieldError errors={[errors.bpm]} />
          </Field>
          <Field data-invalid={!!errors.timeSignature}>
            <FieldLabel htmlFor="timeSignature">Birama</FieldLabel>
            <Input id="timeSignature" className="bg-card" {...form.register("timeSignature")} />
            <FieldError errors={[errors.timeSignature]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.youtubeUrl}>
          <FieldLabel htmlFor="youtubeUrl">Link YouTube</FieldLabel>
          <Input
            id="youtubeUrl"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            className="bg-card"
            {...form.register("youtubeUrl")}
          />
          <FieldError errors={[errors.youtubeUrl]} />
        </Field>
      </FieldGroup>

      <ImportPanel onImported={handleImported} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Field data-invalid={!!errors.content}>
          <FieldLabel htmlFor="content">Chord dan lirik</FieldLabel>
          <FieldDescription>
            Label bagian di baris sendiri, misalnya [Verse 1] atau [Chorus]. Baris chord ditulis
            tepat di atas liriknya, boleh pakai . / dan | untuk ketukan dan birama (G . . . | C . .
            .). Not angka melodi (1 . 2 3 | 5 . . .) ditulis di antara baris chord dan lirik, dan
            tidak ikut berubah saat key diganti.
          </FieldDescription>
          <Textarea
            id="content"
            wrap="off"
            spellCheck={false}
            placeholder={CONTENT_EXAMPLE}
            className="min-h-[28rem] bg-card font-mono text-sm leading-6"
            {...form.register("content")}
          />
          <FieldError errors={[errors.content]} />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium">Preview</p>
          <Card className="lg:sticky lg:top-32">
            <CardContent>
              {content.trim() ? (
                <ChordSheet content={content} originalKey={songKey} currentKey={songKey} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Preview muncul di sini saat chord dan lirik diisi.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-5">
        <Button type="submit" size="lg" disabled={isSaving}>
          {isSaving ? "Menyimpan..." : song ? "Simpan perubahan" : "Tambah lagu"}
        </Button>
        {isDirty && (
          <span className="text-xs text-muted-foreground">
            {lastDraftAt
              ? `Belum disimpan · draft otomatis ${formatDraftTime(lastDraftAt)}`
              : "Belum disimpan"}
          </span>
        )}
        {song && (
          <Button asChild variant="outline" size="lg" className="bg-card">
            <Link href={`/lagu/${song.slug}`} target="_blank">
              <ExternalLinkIcon />
              Lihat di aplikasi
            </Link>
          </Button>
        )}
        {song && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="ml-auto text-destructive hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2Icon />
                Hapus lagu
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus lagu ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{song.title}&quot; akan hilang dari library, beserta jumlah suka dan
                  view-nya. Setlist yang memakai lagu ini akan melewatinya.
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
        )}
      </div>
    </form>
  );
}
