"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changeTeamCode } from "@/lib/actions/admin-settings";
import { teamCodeSchema, type TeamCodeValues } from "@/lib/validations/admin";

export default function TeamCodeForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TeamCodeValues>({
    resolver: zodResolver(teamCodeSchema),
    defaultValues: { code: "", confirm: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: TeamCodeValues) {
    if (!window.confirm("Ganti kode akses? Semua anggota harus memasukkan kode baru.")) return;

    startTransition(async () => {
      const result = await changeTeamCode(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      form.reset();
      toast.success("Kode akses diganti. Bagikan kode baru ke anggota tim.");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-sm">
      <FieldGroup>
        <Field data-invalid={!!errors.code}>
          <FieldLabel htmlFor="code">Kode akses baru</FieldLabel>
          <Input
            id="code"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="bg-card"
            {...form.register("code")}
          />
          <FieldDescription>
            Minimal 6 karakter, huruf besar/kecil tidak dibedakan.
          </FieldDescription>
          <FieldError errors={[errors.code]} />
        </Field>
        <Field data-invalid={!!errors.confirm}>
          <FieldLabel htmlFor="confirm">Ulangi kode</FieldLabel>
          <Input
            id="confirm"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="bg-card"
            {...form.register("confirm")}
          />
          <FieldError errors={[errors.confirm]} />
        </Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Ganti kode akses"}
        </Button>
      </FieldGroup>
    </form>
  );
}
