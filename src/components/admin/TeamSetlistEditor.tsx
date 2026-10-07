"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  DraftBanner,
  LeaveConfirmDialog,
  formatDraftTime,
} from "@/components/admin/UnsavedChanges";
import SetlistItemsEditor from "@/components/setlist/SetlistItemsEditor";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { clearDraft, useDraftAutosave, useInitialDraft } from "@/hooks/use-draft";
import { useLeaveConfirmation } from "@/hooks/use-leave-confirmation";
import { deleteTeamSetlist, saveTeamSetlist } from "@/lib/actions/admin-setlists";
import { nextSunday } from "@/lib/setlist-utils";
import { setlistSchema, type SetlistValues } from "@/lib/validations/setlist";
import type { Setlist, SetlistItem } from "@/types/setlist";
import type { SongSummary } from "@/types/song";

type TeamSetlistEditorProps = {
  // kosong berarti setlist baru
  setlist?: Setlist;
  songs: SongSummary[];
};

type SetlistDraft = SetlistValues & { items: SetlistItem[] };

export default function TeamSetlistEditor({ setlist, songs }: TeamSetlistEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState<SetlistItem[]>(setlist?.items ?? []);
  // daftar lagu terakhir yang tersimpan, untuk tahu ada perubahan atau tidak
  const [savedItems, setSavedItems] = useState<SetlistItem[]>(setlist?.items ?? []);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const form = useForm<SetlistValues>({
    resolver: zodResolver(setlistSchema),
    defaultValues: { name: setlist?.name ?? "", date: setlist?.date ?? nextSunday() },
  });
  const { errors, isDirty: isFormDirty, defaultValues } = form.formState;
  const [name, date] = useWatch({ control: form.control, name: ["name", "date"] });
  const hasChanges = isFormDirty || JSON.stringify(items) !== JSON.stringify(savedItems);

  // draft per setlist, tersimpan di perangkat ini
  const draftKey = `setlist:${setlist?.id ?? "baru"}`;
  const initialDraft = useInitialDraft<SetlistDraft>(draftKey);
  const [isDraftHandled, setIsDraftHandled] = useState(false);
  const lastDraftAt = useDraftAutosave<SetlistDraft>(draftKey, { name, date, items }, hasChanges);
  const leave = useLeaveConfirmation(hasChanges && !isSaving && !isDeleting);
  const showDraftBanner =
    initialDraft !== null &&
    !isDraftHandled &&
    JSON.stringify(initialDraft.values) !==
      JSON.stringify({ name: defaultValues?.name, date: defaultValues?.date, items: savedItems });

  function restoreDraft() {
    if (!initialDraft) return;
    const { items: draftItems, ...values } = initialDraft.values;
    form.reset(values, { keepDefaultValues: true });
    setItems(draftItems);
    setIsDraftHandled(true);
  }

  function discardDraft() {
    clearDraft(draftKey);
    setIsDraftHandled(true);
  }

  function onSubmit(values: SetlistValues) {
    startSaving(async () => {
      const result = await saveTeamSetlist({ ...values, items }, setlist?.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      // sudah tersimpan: draft dibuang dan editor dianggap bersih lagi
      clearDraft(draftKey);
      form.reset(values);
      setSavedItems(items);
      toast.success(setlist ? "Setlist disimpan" : "Setlist tim dibuat");
      if (setlist) router.refresh();
      else router.push(`/admin/setlist/${result.id}`);
    });
  }

  function handleDelete() {
    if (!setlist) return;
    startDeleting(async () => {
      const result = await deleteTeamSetlist(setlist.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      clearDraft(draftKey);
      toast.success("Setlist dihapus");
      router.push("/admin/setlist");
    });
  }

  return (
    <div className="max-w-3xl">
      {showDraftBanner && (
        <div className="mb-6">
          <DraftBanner
            savedAt={initialDraft.savedAt}
            onRestore={restoreDraft}
            onDiscard={discardDraft}
          />
        </div>
      )}
      <LeaveConfirmDialog open={!!leave.pendingHref} onStay={leave.stay} onLeave={leave.leave} />

      {/* daftar lagu di luar form, supaya tombol-tombolnya tidak ikut mengirim form */}
      <form id="team-setlist-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nama setlist</FieldLabel>
            <Input
              id="name"
              placeholder="Contoh: Ibadah Minggu Pagi"
              className="bg-card"
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={!!errors.date}>
            <FieldLabel htmlFor="date">Tanggal</FieldLabel>
            <Input id="date" type="date" className="bg-card" {...form.register("date")} />
            <FieldError errors={[errors.date]} />
          </Field>
        </div>
      </form>

      <div className="mt-6">
        <SetlistItemsEditor
          items={items}
          songs={songs}
          name={name || "Setlist"}
          date={date}
          sharePath={setlist ? `/setlist/tim/${setlist.id}` : undefined}
          onChange={setItems}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-5">
        <Button type="submit" form="team-setlist-form" size="lg" disabled={isSaving}>
          {isSaving ? "Menyimpan..." : setlist ? "Simpan setlist" : "Buat setlist tim"}
        </Button>
        {hasChanges && (
          <span className="text-xs text-muted-foreground">
            {lastDraftAt
              ? `Belum disimpan · draft otomatis ${formatDraftTime(lastDraftAt)}`
              : "Belum disimpan"}
          </span>
        )}
        {setlist && (
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
                Hapus setlist
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus setlist tim ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{setlist.name}&quot; akan hilang dari semua anggota.
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
    </div>
  );
}
