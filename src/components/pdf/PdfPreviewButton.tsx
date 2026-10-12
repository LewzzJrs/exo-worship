"use client";

import { useState } from "react";
import { FileDownIcon } from "lucide-react";
import PdfPreviewDialog, { type PdfContent } from "@/components/pdf/PdfPreviewDialog";
import { Button } from "@/components/ui/button";

type PdfPreviewButtonProps = {
  url: string;
  // beberapa pilihan isi PDF (yang pertama jadi bawaan); kalau kosong hanya url di atas
  contents?: PdfContent[];
  title: string;
  label?: string;
  variant?: "default" | "outline";
  className?: string;
};

// tombol PDF yang membuka preview dulu, baru bisa diunduh
export default function PdfPreviewButton({
  url,
  contents,
  title,
  label = "PDF",
  variant = "default",
  className,
}: PdfPreviewButtonProps) {
  const [openContents, setOpenContents] = useState<PdfContent[] | null>(null);

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={() => setOpenContents(contents ?? [{ label: title, url }])}
      >
        <FileDownIcon />
        {label}
      </Button>
      <PdfPreviewDialog
        contents={openContents}
        title={title}
        onClose={() => setOpenContents(null)}
      />
    </>
  );
}
