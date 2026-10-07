import type { Metadata } from "next";
import { LogOutIcon } from "lucide-react";
import TeamCodeForm from "@/components/admin/TeamCodeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminLogout } from "@/lib/actions/admin-auth";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default function AdminSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Pengaturan</h1>

      <Card className="mt-5 max-w-xl">
        <CardContent>
          <h2 className="font-semibold">Kode akses tim</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Ganti kode kalau sudah tersebar ke orang di luar tim. Setelah diganti, semua HP anggota
            harus memasukkan kode baru.
          </p>
          <TeamCodeForm />
        </CardContent>
      </Card>

      <Card className="mt-5 max-w-xl">
        <CardContent>
          <h2 className="font-semibold">Sesi admin</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Password admin diatur lewat ADMIN_PASSWORD di file .env.local (atau pengaturan hosting).
          </p>
          <form action={adminLogout}>
            <Button type="submit" variant="outline">
              <LogOutIcon />
              Keluar dari admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
