import type { Metadata } from "next";
import Link from "next/link";
import { ListMusicIcon, MessageSquarePlusIcon, MusicIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardCounts } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminDashboardPage() {
  const counts = await getDashboardCounts();

  const stats = [
    { label: "Lagu", value: counts.songs, href: "/admin/lagu", icon: MusicIcon },
    {
      label: "Setlist tim",
      value: counts.teamSetlists,
      href: "/admin/setlist",
      icon: ListMusicIcon,
    },
    {
      label: "Request menunggu",
      value: counts.waitingRequests,
      href: "/admin/request?status=menunggu",
      icon: MessageSquarePlusIcon,
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold">Ringkasan</h1>

      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className="block rounded-xl focus-visible:outline-2">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3">
                  <stat.icon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/admin/lagu/baru">
            <PlusIcon />
            Lagu baru
          </Link>
        </Button>
        <Button asChild variant="outline" className="bg-card">
          <Link href="/admin/setlist/baru">
            <PlusIcon />
            Setlist tim baru
          </Link>
        </Button>
      </div>
    </>
  );
}
