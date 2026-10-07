import type { Metadata } from "next";
import Link from "next/link";
import { PencilIcon, PlusIcon } from "lucide-react";
import SearchInput from "@/components/library/SearchInput";
import AuthorInfo from "@/components/shared/AuthorInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Kelola Lagu",
};

export default async function AdminSongsPage({ searchParams }: PageProps<"/admin/lagu">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const songs = await getSongs({ query, sort: "judul" });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Lagu</h1>
        <Button asChild>
          <Link href="/admin/lagu/baru">
            <PlusIcon />
            Lagu baru
          </Link>
        </Button>
      </div>

      <div className="mt-5 max-w-xl">
        <SearchInput defaultValue={query} path="/admin/lagu" />
      </div>
      <p className="mt-4 mb-3 text-sm text-muted-foreground">
        {query ? `${songs.length} lagu cocok dengan "${query}"` : `${songs.length} lagu`}
      </p>

      <ul className="grid gap-3 md:grid-cols-2">
        {songs.map((song) => (
          <li key={song.slug}>
            <Link
              href={`/admin/lagu/${song.slug}`}
              className="block rounded-xl focus-visible:outline-2"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{song.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {song.artist || "Tanpa artis"}
                    </p>
                    <AuthorInfo
                      className="mt-1 truncate"
                      createdAt={song.createdAt}
                      createdBy={song.createdBy}
                      updatedAt={song.updatedAt}
                      updatedBy={song.updatedBy}
                      showUpdate
                    />
                  </div>
                  <Badge variant="secondary">Key {song.key}</Badge>
                  <PencilIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
