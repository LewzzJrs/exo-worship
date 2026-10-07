import AdminAvatar from "@/components/shared/AdminAvatar";
import { cn } from "@/lib/utils";

const longDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

type AuthorInfoProps = {
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  // "card" untuk halaman detail, "inline" untuk daftar yang padat
  variant?: "card" | "inline";
  className?: string;
};

// dianggap diedit kalau tersimpan ulang lebih dari semenit setelah dibuat
function wasEdited(createdAt: string, updatedAt?: string, updatedBy?: string) {
  return (
    !!updatedBy &&
    !!updatedAt &&
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000
  );
}

function ProfileCard({ label, name, date }: { label: string; name?: string; date: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-card px-3 py-2.5">
      <AdminAvatar name={name} />
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-sm font-semibold">{name ?? "Tidak tercatat"}</p>
        <p className="text-xs text-muted-foreground">{longDate.format(new Date(date))}</p>
      </div>
    </div>
  );
}

function InlineAuthor({ label, name, date }: { label: string; name?: string; date: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <AdminAvatar name={name} size="sm" />
      <span className="truncate">
        {label} {name && <strong className="font-medium text-foreground">{name}</strong>} ·{" "}
        {shortDate.format(new Date(date))}
      </span>
    </span>
  );
}

// siapa yang membuat dan terakhir mengedit lagu atau setlist
export default function AuthorInfo({
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  variant = "card",
  className,
}: AuthorInfoProps) {
  const edited = wasEdited(createdAt, updatedAt, updatedBy);

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
          className,
        )}
      >
        <InlineAuthor label="Dibuat" name={createdBy} date={createdAt} />
        {edited && <InlineAuthor label="Diedit" name={updatedBy} date={updatedAt!} />}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      <ProfileCard label="Dibuat oleh" name={createdBy} date={createdAt} />
      {edited && <ProfileCard label="Terakhir diedit oleh" name={updatedBy} date={updatedAt!} />}
    </div>
  );
}
