"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { nextSunday } from "@/lib/setlist-utils";
import { setlistSchema, type SetlistValues } from "@/lib/validations/setlist";

type SetlistFormDialogProps = {
  trigger: React.ReactNode;
  title: string;
  submitLabel: string;
  defaultValues?: SetlistValues;
  onSubmit: (values: SetlistValues) => void;
};

export default function SetlistFormDialog({
  trigger,
  title,
  submitLabel,
  defaultValues,
  onSubmit,
}: SetlistFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<SetlistValues>({
    resolver: zodResolver(setlistSchema),
    defaultValues: defaultValues ?? { name: "", date: nextSunday() },
  });
  const { errors } = form.formState;

  function handleOpenChange(open: boolean) {
    // isi ulang form setiap kali dialog dibuka
    if (open) form.reset(defaultValues ?? { name: "", date: nextSunday() });
    setIsOpen(open);
  }

  function handleSubmit(values: SetlistValues) {
    onSubmit(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Setlist ini tersimpan di HP kamu.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="setlist-name">Nama setlist</FieldLabel>
              <Input
                id="setlist-name"
                placeholder="Contoh: Ibadah Minggu Pagi"
                aria-invalid={!!errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.date}>
              <FieldLabel htmlFor="setlist-date">Tanggal</FieldLabel>
              <Input
                id="setlist-date"
                type="date"
                aria-invalid={!!errors.date}
                {...form.register("date")}
              />
              <FieldError errors={[errors.date]} />
            </Field>
            <Button type="submit">{submitLabel}</Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
