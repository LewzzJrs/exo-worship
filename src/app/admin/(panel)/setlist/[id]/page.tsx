import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import TeamSetlistEditor from "@/components/admin/TeamSetlistEditor";
import AuthorInfo from "@/components/shared/AuthorInfo";
import { getEditHistory } from "@/lib/edit-history";
import { getTeamSetlist } from "@/lib/setlists";
import { getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Edit Setlist Tim",
};

export default async function EditTeamSetlistPage({ params }: PageProps<"/admin/setlist/[id]">) {
  const { id } = await params;
  const [setlist, songs, edits] = await Promise.all([
    getTeamSetlist(id),
    getSongs({ sort: "judul" }),
    getEditHistory("setlist", id),
  ]);
  if (!setlist) notFound();

  return (
    <>
      <Link
        href="/admin/setlist"
        className="mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Setlist tim
      </Link>
      <h1 className="text-2xl font-semibold">Edit setlist tim</h1>
      <AuthorInfo
        className="mt-3 mb-6 max-w-xl"
        createdAt={setlist.createdAt}
        createdBy={setlist.createdBy}
        updatedAt={setlist.updatedAt}
        updatedBy={setlist.updatedBy}
        edits={edits}
      />
      <TeamSetlistEditor setlist={setlist} songs={songs} />
    </>
  );
}
