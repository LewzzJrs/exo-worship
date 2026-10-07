import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RequestStatus, SongRequest } from "@/types/request";

const STATUS_LABEL: Record<RequestStatus, { label: string; className: string }> = {
  menunggu: { label: "Menunggu", className: "bg-secondary text-secondary-foreground" },
  diproses: { label: "Diproses", className: "bg-amber-100 text-amber-900" },
  selesai: { label: "Selesai", className: "bg-emerald-100 text-emerald-900" },
  ditolak: { label: "Ditolak", className: "bg-red-100 text-red-900" },
};

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export default function RequestList({ requests }: { requests: SongRequest[] }) {
  if (requests.length === 0) {
    return (
      <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground">
        Belum ada request dari HP ini.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {requests.map((request) => {
        const status = STATUS_LABEL[request.status];

        return (
          <li key={request.id}>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{request.title}</p>
                    {request.artist && (
                      <p className="truncate text-sm text-muted-foreground">{request.artist}</p>
                    )}
                  </div>
                  <Badge className={cn("shrink-0", status.className)}>{status.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dateFormat.format(new Date(request.createdAt))} · oleh {request.requesterName}
                </p>
                {request.status === "selesai" && request.songSlug && (
                  <Link
                    href={`/lagu/${request.songSlug}`}
                    className="inline-block pt-1 text-sm font-medium underline underline-offset-4"
                  >
                    Buka lagunya
                  </Link>
                )}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
