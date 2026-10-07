"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import AdminAvatar from "@/components/shared/AdminAvatar";
import { chooseAdminName } from "@/lib/actions/admin-auth";
import { ADMIN_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// pilih profil admin seperti memilih akun
export default function ChooseAdminName({ currentName }: { currentName: string | null }) {
  const [isPending, startTransition] = useTransition();

  function handleChoose(name: string) {
    startTransition(async () => {
      // kalau berhasil, server langsung mengarahkan ke halaman admin
      const result = await chooseAdminName(name);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <ul className="grid grid-cols-3 gap-3">
      {ADMIN_NAMES.map((name) => {
        const isCurrent = name === currentName;

        return (
          <li key={name}>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleChoose(name)}
              className={cn(
                "flex w-full flex-col items-center gap-2 rounded-2xl border bg-card px-2 py-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 disabled:opacity-60",
                isCurrent && "border-foreground ring-2 ring-foreground/10",
              )}
            >
              <AdminAvatar name={name} size="lg" />
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-[11px] text-muted-foreground">
                {isCurrent ? "Sedang dipakai" : "Admin"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
