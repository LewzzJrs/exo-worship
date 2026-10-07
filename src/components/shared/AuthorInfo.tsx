import { ChevronDownIcon } from "lucide-react";
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

// sama dengan EditEntry di lib/edit-history (ditulis ulang supaya file ini bisa dipakai di browser)
type Edit = { name: string; at: string; count: number };

type AuthorInfoProps = {
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  // semua edit dari riwayat admin; kalau kosong, pakai edit terakhir saja
  edits?: Edit[];
  // "card" untuk halaman detail, "inline" untuk daftar yang padat
  variant?: "card" | "inline";
  className?: string;
};

// jumlah edit yang langsung terlihat, sisanya bisa dibuka
const VISIBLE_EDITS = 3;

// dianggap diedit kalau tersimpan ulang lebih dari semenit setelah dibuat
function wasEdited(createdAt: string, updatedAt?: string, updatedBy?: string) {
  return (
    !!updatedBy &&
    !!updatedAt &&
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000
  );
}

function CreatedCard({ name, date }: { name?: string; date: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 self-start rounded-xl border bg-card px-3 py-2.5">
      <AdminAvatar name={name} />
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Dibuat oleh</p>
        <p className="truncate text-sm font-semibold">{name ?? "Tidak tercatat"}</p>
        <p className="text-xs text-muted-foreground">{longDate.format(new Date(date))}</p>
      </div>
    </div>
  );
}

function EditRow({ edit }: { edit: Edit }) {
  return (
    <li className="flex items-center gap-2.5 py-1.5">
      <AdminAvatar name={edit.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{edit.name}</p>
        <p className="text-xs text-muted-foreground">
          {longDate.format(new Date(edit.at))}
          {edit.count > 1 && ` · ${edit.count}x disimpan`}
        </p>
      </div>
    </li>
  );
}

function EditsCard({ edits }: { edits: Edit[] }) {
  const visible = edits.slice(0, VISIBLE_EDITS);
  const hidden = edits.slice(VISIBLE_EDITS);
  const totalSaves = edits.reduce((total, edit) => total + edit.count, 0);

  return (
    <div className="min-w-0 rounded-xl border bg-card px-3 py-2.5">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
        Diedit oleh{totalSaves > 1 && ` · ${totalSaves} kali`}
      </p>
      <ul className="divide-y">
        {visible.map((edit) => (
          <EditRow key={edit.at} edit={edit} />
        ))}
      </ul>
      {hidden.length > 0 && (
        // dibuka-tutup tanpa JavaScript
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1 pt-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            Lihat {hidden.length} lainnya
            <ChevronDownIcon className="size-3.5 transition group-open:rotate-180" />
          </summary>
          <ul className="divide-y">
            {hidden.map((edit) => (
              <EditRow key={edit.at} edit={edit} />
            ))}
          </ul>
        </details>
      )}
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

// siapa yang membuat dan siapa saja yang mengedit lagu atau setlist
export default function AuthorInfo({
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  edits,
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

  // edit lama sebelum riwayat dicatat: tampilkan edit terakhirnya saja
  const editList =
    edits && edits.length > 0
      ? edits
      : edited
        ? [{ name: updatedBy!, at: updatedAt!, count: 1 }]
        : [];

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      <CreatedCard name={createdBy} date={createdAt} />
      {editList.length > 0 && <EditsCard edits={editList} />}
    </div>
  );
}
