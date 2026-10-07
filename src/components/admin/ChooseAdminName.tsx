"use client";

import { useTransition } from "react";
import { UserRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { chooseAdminName } from "@/lib/actions/admin-auth";
import { ADMIN_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
    <ul className="grid gap-3">
      {ADMIN_NAMES.map((name) => (
        <li key={name}>
          <Button
            variant={name === currentName ? "default" : "outline"}
            size="lg"
            className={cn("h-14 w-full justify-start text-base", name !== currentName && "bg-card")}
            disabled={isPending}
            onClick={() => handleChoose(name)}
          >
            <UserRoundIcon />
            {name}
            {name === currentName && <span className="ml-auto text-xs">sekarang</span>}
          </Button>
        </li>
      ))}
    </ul>
  );
}
