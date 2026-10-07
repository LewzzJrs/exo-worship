"use client";

import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SetlistCard from "@/components/setlist/SetlistCard";
import SetlistFormDialog from "@/components/setlist/SetlistFormDialog";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSetlistStore } from "@/store/setlists";

export default function MySetlistList() {
  const router = useRouter();
  const isHydrated = useHydrated();
  const setlists = useSetlistStore((state) => state.setlists);
  const createSetlist = useSetlistStore((state) => state.createSetlist);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Setlist saya</h2>
        <SetlistFormDialog
          title="Setlist baru"
          submitLabel="Buat setlist"
          trigger={
            <Button size="sm">
              <PlusIcon />
              Buat setlist
            </Button>
          }
          onSubmit={(values) => {
            const id = createSetlist(values.name, values.date);
            router.push(`/setlist/saya/${id}`);
          }}
        />
      </div>

      {isHydrated &&
        (setlists.length > 0 ? (
          <ul className="grid gap-3">
            {setlists.map((setlist) => (
              <li key={setlist.id}>
                <SetlistCard setlist={setlist} href={`/setlist/saya/${setlist.id}`} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground">
            Belum ada setlist pribadi. Setlist saya hanya tersimpan di HP ini.
          </p>
        ))}
    </>
  );
}
