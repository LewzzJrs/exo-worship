"use client";

import { Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareText } from "@/lib/setlist-utils";

type ShareSetlistButtonProps = {
  name: string;
  date: string;
  songs: { title: string; key: string; note?: string }[];
  // link setlist untuk anggota; kosong untuk setlist pribadi yang hanya ada di HP
  path?: string;
};

export default function ShareSetlistButton({ name, date, songs, path }: ShareSetlistButtonProps) {
  function handleShare() {
    const url = path ? new URL(path, window.location.origin).href : undefined;
    const text = buildShareText(name, date, songs, url);
    // wa.me membuka aplikasi WhatsApp di HP, atau WhatsApp Web di laptop
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  return (
    <Button variant="outline" className="bg-card" onClick={handleShare} disabled={!songs.length}>
      <Share2Icon />
      Bagikan ke WhatsApp
    </Button>
  );
}
