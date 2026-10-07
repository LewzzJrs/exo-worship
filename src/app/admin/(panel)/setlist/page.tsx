import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import SetlistCard from "@/components/setlist/SetlistCard";
import { Button } from "@/components/ui/button";
import { getTeamSetlists } from "@/lib/setlists";

export const metadata: Metadata = {
  title: "Kelola Setlist Tim",
};

export default async function AdminSetlistsPage() {
  const setlists = await getTeamSetlists();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Setlist tim</h1>
        <Button asChild>
          <Link href="/admin/setlist/baru">
            <PlusIcon />
            Setlist baru
          </Link>
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Setlist ini terlihat oleh semua anggota.</p>

      {setlists.length === 0 ? (
        <p className="mt-5 rounded-xl bg-card p-4 text-sm text-muted-foreground">
          Belum ada setlist tim.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {setlists.map((setlist) => (
            <li key={setlist.id}>
              <SetlistCard setlist={setlist} href={`/admin/setlist/${setlist.id}`} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
