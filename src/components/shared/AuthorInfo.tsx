import { cn } from "@/lib/utils";

const longDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

// "2026-10-07T09:12:00Z" -> "7 Oktober 2026"
export function formatLongDate(iso: string) {
  return longDate.format(new Date(iso));
}

type AuthorInfoProps = {
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  // anggota cukup melihat siapa yang membuat, admin juga melihat perubahan terakhir
  showUpdate?: boolean;
  className?: string;
};

// "Dibuat oleh Lewi pada 7 Oktober 2026 · Diubah oleh Ester pada 8 Oktober 2026"
export default function AuthorInfo({
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  showUpdate = false,
  className,
}: AuthorInfoProps) {
  const created = `Dibuat${createdBy ? ` oleh ${createdBy}` : ""} pada ${formatLongDate(createdAt)}`;

  // dianggap diubah kalau tersimpan ulang lebih dari semenit setelah dibuat
  const wasUpdated =
    showUpdate &&
    updatedBy &&
    updatedAt &&
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000;

  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {created}
      {wasUpdated && ` · Diubah oleh ${updatedBy} pada ${formatLongDate(updatedAt)}`}
    </p>
  );
}
