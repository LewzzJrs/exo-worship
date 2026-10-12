import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import TeamSetlistEditor from "@/components/admin/TeamSetlistEditor";
import { getSongFlows, getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Setlist Tim Baru",
};

export default async function NewTeamSetlistPage() {
  const [songs, songFlows] = await Promise.all([getSongs({ sort: "judul" }), getSongFlows()]);

  return (
    <>
      <Link
        href="/admin/setlist"
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Setlist tim
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Setlist tim baru</h1>
      <TeamSetlistEditor songs={songs} songFlows={songFlows} />
    </>
  );
}
