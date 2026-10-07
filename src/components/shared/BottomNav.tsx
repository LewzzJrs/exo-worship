"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActiveLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// navigasi bawah, khusus HP
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-md">
        {NAV_LINKS.map((link) => {
          const isActive = isActiveLink(link.href, pathname);
          const Icon = link.icon;

          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground",
                  isActive && "text-foreground",
                )}
              >
                <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
