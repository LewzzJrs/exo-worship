"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActiveLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// navigasi di header, khusus layar lebar
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((link) => {
        const isActive = isActiveLink(link.href, pathname);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              isActive && "bg-card text-foreground shadow-xs",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
