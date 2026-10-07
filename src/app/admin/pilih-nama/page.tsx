import type { Metadata } from "next";
import ChooseAdminName from "@/components/admin/ChooseAdminName";
import Logo from "@/components/shared/Logo";
import { getAdminName, verifyAdmin } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pilih Nama Admin",
};

export default async function PilihNamaPage() {
  await verifyAdmin();
  const currentName = await getAdminName();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-20" />
          <h1 className="mt-4 text-xl font-semibold">Siapa yang sedang bertugas?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nama ini dicatat setiap kali kamu membuat atau mengubah lagu dan setlist.
          </p>
        </div>
        <ChooseAdminName currentName={currentName} />
      </div>
    </main>
  );
}
