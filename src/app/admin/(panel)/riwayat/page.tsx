import type { Metadata } from "next";
import Link from "next/link";
import { ListMusicIcon, MusicIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminActivity, type AdminActivity } from "@/lib/admin-data";
import { ADMIN_NAMES, isAdminName } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Riwayat Admin",
};

const ACTION_LABEL: Record<AdminActivity["action"], string> = {
  dibuat: "membuat",
  diubah: "mengubah",
  dihapus: "menghapus",
};

const dateTime = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

function entityHref(activity: AdminActivity) {
  if (activity.action === "dihapus") return null;
  return activity.entity === "lagu"
    ? `/admin/lagu/${activity.entityId}`
    : `/admin/setlist/${activity.entityId}`;
}

export default async function AdminActivityPage({ searchParams }: PageProps<"/admin/riwayat">) {
  const { admin } = await searchParams;
  const activeAdmin = typeof admin === "string" && isAdminName(admin) ? admin : undefined;
  const activities = await getAdminActivity(activeAdmin);

  return (
    <>
      <h1 className="text-2xl font-semibold">Riwayat</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Siapa membuat, mengubah, atau menghapus lagu dan setlist tim.
      </p>

      <nav className="-mx-4 mt-4 overflow-x-auto px-4">
        <ul className="flex gap-1">
          {[undefined, ...ADMIN_NAMES].map((name) => (
            <li key={name ?? "semua"} className="shrink-0">
              <Link
                href={name ? `/admin/riwayat?admin=${name}` : "/admin/riwayat"}
                className={cn(
                  "block rounded-full border px-3 py-1 text-sm",
                  name === activeAdmin
                    ? "border-foreground bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {name ?? "Semua"}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {activities.length === 0 ? (
        <p className="mt-5 rounded-xl bg-card p-4 text-sm text-muted-foreground">
          Belum ada riwayat.
        </p>
      ) : (
        <Card className="mt-5">
          <CardContent>
            <ul className="divide-y">
              {activities.map((activity) => {
                const href = entityHref(activity);
                const Icon = activity.entity === "lagu" ? MusicIcon : ListMusicIcon;
                const title = `“${activity.entityTitle}”`;

                return (
                  <li key={activity.id} className="flex items-start gap-3 py-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm">
                        <strong>{activity.adminName}</strong> {ACTION_LABEL[activity.action]}{" "}
                        {activity.entity}{" "}
                        {href ? (
                          <Link href={href} className="font-medium underline underline-offset-4">
                            {title}
                          </Link>
                        ) : (
                          <span className="font-medium">{title}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dateTime.format(new Date(activity.createdAt))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
