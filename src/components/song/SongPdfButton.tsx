"use client";

import { FileDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentKey } from "@/lib/current-key";
import { buildPdfUrl } from "@/lib/setlist-utils";

type SongPdfButtonProps = {
  slug: string;
  originalKey: string;
};

export default function SongPdfButton({ slug, originalKey }: SongPdfButtonProps) {
  function handleClick() {
    // PDF mengikuti key yang sedang dipilih
    const link = document.createElement("a");
    link.href = buildPdfUrl({ items: [{ slug, key: getCurrentKey(originalKey) }] });
    link.download = "";
    link.click();
  }

  return (
    <Button variant="outline" className="bg-card" onClick={handleClick}>
      <FileDownIcon />
      PDF
    </Button>
  );
}
