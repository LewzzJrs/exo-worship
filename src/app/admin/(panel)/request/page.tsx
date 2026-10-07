import type { Metadata } from "next";
import Link from "next/link";
import AdminRequestCard from "@/components/admin/AdminRequestCard";
import { getAllRequests } from "@/lib/admin-data";
import { getSongs } from "@/lib/songs";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/request";

export const metadata: Metadata = {
  title: "Kelola Request",
};

const FILTERS: { value?: RequestStatus; label: string }[] = [
  { label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "ditolak", label: "Ditolak" },
];

export default async function AdminRequestsPage({ searchParams }: PageProps<"/admin/request">) {
  const { status } = await searchParams;
  const activeStatus = FILTERS.find((filter) => filter.value === status)?.value;
  const [requests, songs] = await Promise.all([
    getAllRequests(activeStatus),
    getSongs({ sort: "judul" }),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Request lagu</h1>

      <nav className="-mx-4 mt-4 overflow-x-auto px-4">
        <ul className="flex gap-1">
          {FILTERS.map((filter) => (
            <li key={filter.label} className="shrink-0">
              <Link
                href={filter.value ? `/admin/request?status=${filter.value}` : "/admin/request"}
                className={cn(
                  "block rounded-full border px-3 py-1 text-sm",
                  filter.value === activeStatus
                    ? "border-foreground bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {requests.length === 0 ? (
        <p className="mt-5 rounded-xl bg-card p-4 text-sm text-muted-foreground">
          Tidak ada request.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {requests.map((request) => (
            <li key={`${request.id}-${request.status}-${request.songSlug}`}>
              <AdminRequestCard request={request} songs={songs} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
