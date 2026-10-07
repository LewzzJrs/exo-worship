import type { Metadata } from "next";
import Link from "next/link";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import Logo from "@/components/shared/Logo";

export const metadata: Metadata = {
  title: "Masuk Admin",
};

export default function AdminMasukPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-20" />
          <h1 className="mt-4 text-xl font-semibold">Admin Exo Worship Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Khusus admin untuk mengelola lagu, setlist, dan request.
          </p>
        </div>
        <AdminLoginForm />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bukan admin?{" "}
          <Link href="/" className="underline underline-offset-4">
            Kembali ke aplikasi
          </Link>
        </p>
      </div>
    </main>
  );
}
