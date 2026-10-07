import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SongNotFound() {
  return (
    <div className="rounded-xl bg-card p-8 text-center">
      <h1 className="text-lg font-semibold">Lagu tidak ditemukan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Mungkin lagunya sudah dihapus atau link-nya salah.
      </p>
      <Button asChild className="mt-4">
        <Link href="/library">Kembali ke Library</Link>
      </Button>
    </div>
  );
}
