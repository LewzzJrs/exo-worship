import type { Metadata } from "next";
import AccessForm from "@/components/auth/AccessForm";
import CopyrightFooter from "@/components/shared/CopyrightFooter";
import Logo from "@/components/shared/Logo";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Masuk",
};

export default async function MasukPage({ searchParams }: PageProps<"/masuk">) {
  const { next } = await searchParams;

  return (
    <>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="h-20" />
            <h1 className="mt-4 text-xl font-semibold">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Masukkan kode akses tim untuk membuka library lagu.
            </p>
          </div>
          <AccessForm next={typeof next === "string" ? next : undefined} />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Belum punya kode? Tanyakan ke admin tim.
          </p>
        </div>
      </main>
      <CopyrightFooter />
    </>
  );
}
