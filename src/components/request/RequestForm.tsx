"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHydrated } from "@/hooks/use-hydrated";
import { createRequest } from "@/lib/actions/request";
import { requestSchema, type RequestValues } from "@/lib/validations/request";
import { useProfileStore } from "@/store/profile";

const emptyValues: RequestValues = {
  requesterName: "",
  title: "",
  artist: "",
  youtubeUrl: "",
  note: "",
};

export default function RequestForm() {
  const [isPending, startTransition] = useTransition();
  const isHydrated = useHydrated();
  const savedName = useProfileStore((state) => state.name);
  const setSavedName = useProfileStore((state) => state.setName);
  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: emptyValues,
  });
  const { errors } = form.formState;

  // isi nama dari request sebelumnya
  useEffect(() => {
    if (isHydrated && savedName && !form.getValues("requesterName")) {
      form.setValue("requesterName", savedName);
    }
  }, [isHydrated, savedName, form]);

  function onSubmit(values: RequestValues) {
    startTransition(async () => {
      const result = await createRequest(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSavedName(values.requesterName);
      form.reset({ ...emptyValues, requesterName: values.requesterName });
      toast.success("Request terkirim ke admin");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.requesterName}>
          <FieldLabel htmlFor="requesterName">Nama kamu</FieldLabel>
          <Input
            id="requesterName"
            autoComplete="name"
            className="h-10 bg-card"
            aria-invalid={!!errors.requesterName}
            {...form.register("requesterName")}
          />
          <FieldError errors={[errors.requesterName]} />
        </Field>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Judul lagu</FieldLabel>
          <Input
            id="title"
            className="h-10 bg-card"
            aria-invalid={!!errors.title}
            {...form.register("title")}
          />
          <FieldError errors={[errors.title]} />
        </Field>
        <Field data-invalid={!!errors.artist}>
          <FieldLabel htmlFor="artist">Artis (opsional)</FieldLabel>
          <Input
            id="artist"
            placeholder="Contoh: JPCC Worship"
            className="h-10 bg-card"
            aria-invalid={!!errors.artist}
            {...form.register("artist")}
          />
          <FieldError errors={[errors.artist]} />
        </Field>
        <Field data-invalid={!!errors.youtubeUrl}>
          <FieldLabel htmlFor="youtubeUrl">Link YouTube (opsional)</FieldLabel>
          <Input
            id="youtubeUrl"
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-10 bg-card"
            aria-invalid={!!errors.youtubeUrl}
            {...form.register("youtubeUrl")}
          />
          <FieldError errors={[errors.youtubeUrl]} />
        </Field>
        <Field data-invalid={!!errors.note}>
          <FieldLabel htmlFor="note">Catatan (opsional)</FieldLabel>
          <Textarea
            id="note"
            placeholder="Misalnya: untuk ibadah Minggu depan, versi live"
            className="bg-card"
            aria-invalid={!!errors.note}
            {...form.register("note")}
          />
          <FieldError errors={[errors.note]} />
        </Field>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Mengirim..." : "Kirim request"}
        </Button>
      </FieldGroup>
    </form>
  );
}
