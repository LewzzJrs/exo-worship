import Link from "next/link";
import { ExternalLinkIcon, UserRoundIcon } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import Logo from "@/components/shared/Logo";
import { Badge } from "@/components/ui/badge";
import { requireAdminName } from "@/lib/dal";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const adminName = await requireAdminName();

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between gap-2">
            <Link href="/admin" className="flex items-center gap-2" aria-label="Admin">
              <Logo className="h-10" />
              <Badge variant="secondary">Admin</Badge>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/pilih-nama"
                className="flex items-center gap-1 text-sm font-medium hover:underline"
                title="Ganti nama admin"
              >
                <UserRoundIcon className="size-4" />
                {adminName}
              </Link>
              <Link
                href="/"
                className="hidden items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground sm:flex"
              >
                Lihat aplikasi
                <ExternalLinkIcon className="size-3.5" />
              </Link>
            </div>
          </div>
          <div className="pb-2">
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16">{children}</main>
    </>
  );
}
