"use client";

import { useState } from "react";
import { FileDownIcon } from "lucide-react";
import PdfPreviewDialog from "@/components/pdf/PdfPreviewDialog";
import { Button } from "@/components/ui/button";
import { getCurrentKey } from "@/lib/current-key";
import { buildPdfUrl } from "@/lib/setlist-utils";

type SongPdfButtonProps = {
  slug: string;
  title: string;
  originalKey: string;
};

export default function SongPdfButton({ slug, title, originalKey }: SongPdfButtonProps) {
  const [preview, setPreview] = useState<{ url: string; key: string } | null>(null);

  function handleClick() {
    // PDF mengikuti key yang sedang dipilih
    const key = getCurrentKey(originalKey);
    setPreview({ url: buildPdfUrl({ items: [{ slug, key }] }), key });
  }

  return (
    <>
      <Button variant="outline" className="bg-card" onClick={handleClick}>
        <FileDownIcon />
        PDF
      </Button>
      <PdfPreviewDialog
        url={preview?.url ?? null}
        title={preview ? `${title} (key ${preview.key})` : title}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
