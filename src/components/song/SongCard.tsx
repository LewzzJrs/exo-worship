import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SongSummary } from "@/types/song";

export default function SongCard({ song }: { song: SongSummary }) {
  return (
    <Link href={`/lagu/${song.slug}`} className="block rounded-xl focus-visible:outline-2">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{song.title}</CardTitle>
            <CardDescription className="truncate">{song.artist}</CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Key {song.key}
          </Badge>
        </CardHeader>
      </Card>
    </Link>
  );
}
