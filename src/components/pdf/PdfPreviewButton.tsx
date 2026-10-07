"use client";

import { useState } from "react";
import { FileDownIcon } from "lucide-react";
import PdfPreviewDialog from "@/components/pdf/PdfPreviewDialog";
import { Button } from "@/components/ui/button";

type PdfPreviewButtonProps = {
  url: string;
  title: string;
  label?: string;
  variant?: "default" | "outline";
  className?: string;
};

// tombol PDF yang membuka preview dulu, baru bisa diunduh
export default function PdfPreviewButton({
  url,
  title,
  label = "PDF",
  variant = "default",
  className,
}: PdfPreviewButtonProps) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  return (
    <>
      <Button variant={variant} className={className} onClick={() => setOpenUrl(url)}>
        <FileDownIcon />
        {label}
      </Button>
      <PdfPreviewDialog url={openUrl} title={title} onClose={() => setOpenUrl(null)} />
    </>
  );
}
