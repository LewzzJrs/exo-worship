"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { enterAccessCode } from "@/lib/actions/access";
import { accessSchema, type AccessValues } from "@/lib/validations/access";

export default function AccessForm({ next }: { next?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<AccessValues>({
    resolver: zodResolver(accessSchema),
    defaultValues: { code: "" },
  });
  const codeError = form.formState.errors.code;

  function onSubmit(values: AccessValues) {
    startTransition(async () => {
      // kalau berhasil, server langsung mengarahkan ke halaman tujuan
      const result = await enterAccessCode(values, next);
      if (result?.error) form.setError("code", { message: result.error });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!codeError}>
          <FieldLabel htmlFor="code">Kode akses tim</FieldLabel>
          <Input
            id="code"
            placeholder="Contoh: EXO-1234"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="h-10 bg-card"
            aria-invalid={!!codeError}
            {...form.register("code")}
          />
          <FieldError errors={[codeError]} />
        </Field>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Memeriksa..." : "Masuk"}
        </Button>
      </FieldGroup>
    </form>
  );
}
