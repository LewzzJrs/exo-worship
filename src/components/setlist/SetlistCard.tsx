import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSetlistDate } from "@/lib/setlist-utils";
import type { Setlist } from "@/types/setlist";

export default function SetlistCard({ setlist, href }: { setlist: Setlist; href: string }) {
  return (
    <Link href={href} className="block rounded-xl focus-visible:outline-2">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="truncate">{setlist.name}</CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            {formatSetlistDate(setlist.date)} · {setlist.items.length} lagu
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
