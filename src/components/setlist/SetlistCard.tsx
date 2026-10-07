import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import AuthorInfo from "@/components/shared/AuthorInfo";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSetlistDate } from "@/lib/setlist-utils";
import type { Setlist } from "@/types/setlist";

type SetlistCardProps = {
  setlist: Setlist;
  href: string;
  // tampilkan siapa yang membuat (setlist tim)
  showAuthor?: boolean;
};

export default function SetlistCard({ setlist, href, showAuthor = false }: SetlistCardProps) {
  return (
    <Link href={href} className="block rounded-xl focus-visible:outline-2">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="truncate">{setlist.name}</CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            {formatSetlistDate(setlist.date)} · {setlist.items.length} lagu
          </CardDescription>
          {showAuthor && (
            <AuthorInfo
              createdAt={setlist.createdAt}
              createdBy={setlist.createdBy}
              updatedAt={setlist.updatedAt}
              updatedBy={setlist.updatedBy}
              variant="inline"
              className="mt-1"
            />
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
