"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { adminLogin } from "@/lib/actions/admin-auth";
import { adminLoginSchema, type AdminLoginValues } from "@/lib/validations/admin";

export default function AdminLoginForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { password: "" },
  });
  const passwordError = form.formState.errors.password;

  function onSubmit(values: AdminLoginValues) {
    startTransition(async () => {
      const result = await adminLogin(values);
      if (result?.error) form.setError("password", { message: result.error });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!passwordError}>
          <FieldLabel htmlFor="password">Password admin</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-10 bg-card"
            aria-invalid={!!passwordError}
            {...form.register("password")}
          />
          <FieldError errors={[passwordError]} />
        </Field>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Memeriksa..." : "Masuk"}
        </Button>
      </FieldGroup>
    </form>
  );
}
