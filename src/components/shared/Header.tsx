import Link from "next/link";
import { CircleHelpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import NavLinks from "@/components/shared/NavLinks";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-2 px-4">
        <Link href="/" aria-label="Beranda Exo Worship Library">
          <Logo className="h-12" />
        </Link>
        <div className="flex items-center gap-1">
          <NavLinks />
          <Button asChild variant="ghost" size="icon" aria-label="Bantuan">
            <Link href="/bantuan">
              <CircleHelpIcon />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
