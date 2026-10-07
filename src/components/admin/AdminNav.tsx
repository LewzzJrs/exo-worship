"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/lagu", label: "Lagu" },
  { href: "/admin/setlist", label: "Setlist Tim" },
  { href: "/admin/rekomendasi", label: "Rekomendasi" },
  { href: "/admin/request", label: "Request" },
  { href: "/admin/riwayat", label: "Riwayat" },
  { href: "/admin/pengaturan", label: "Pengaturan" },
];

// menu Rekomendasi hanya untuk admin yang boleh mengaturnya
export default function AdminNav({ showRecommendations }: { showRecommendations: boolean }) {
  const pathname = usePathname();
  const links = ADMIN_LINKS.filter(
    (link) => showRecommendations || link.href !== "/admin/rekomendasi",
  );

  return (
    // bisa digeser ke samping di HP
    <nav className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {links.map((link) => {
          const isActive =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
                  isActive && "bg-card text-foreground shadow-xs",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
