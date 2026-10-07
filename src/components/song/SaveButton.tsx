"use client";

import { BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/store/library";

export default function SaveButton({ slug }: { slug: string }) {
  const isHydrated = useHydrated();
  const isSaved = useLibraryStore((state) => state.savedSlugs.includes(slug));
  const toggleSaved = useLibraryStore((state) => state.toggleSaved);

  // sebelum data dari HP terbaca, tampilkan tombol dalam keadaan netral
  const saved = isHydrated && isSaved;

  function handleClick() {
    toggleSaved(slug);
    toast.success(saved ? "Dihapus dari Library Saya" : "Disimpan ke Library Saya");
  }

  return (
    <Button
      variant={saved ? "default" : "outline"}
      className={cn(!saved && "bg-card")}
      aria-pressed={saved}
      disabled={!isHydrated}
      onClick={handleClick}
    >
      <BookmarkIcon className={cn(saved && "fill-current")} />
      {saved ? "Tersimpan" : "Simpan"}
    </Button>
  );
}
