import type { Metadata } from "next";
import MySetlistList from "@/components/setlist/MySetlistList";
import SetlistCard from "@/components/setlist/SetlistCard";
import { getTeamSetlists } from "@/lib/setlists";

export const metadata: Metadata = {
  title: "Setlist",
};

export default async function SetlistPage() {
  const teamSetlists = await getTeamSetlists();

  return (
    <>
      <h1 className="text-2xl font-semibold">Setlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Daftar lagu untuk ibadah, lengkap dengan key dan PDF gabungan.
      </p>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold">Setlist tim</h2>
        {teamSetlists.length > 0 ? (
          <ul className="grid gap-3">
            {teamSetlists.map((setlist) => (
              <li key={setlist.id}>
                <SetlistCard setlist={setlist} href={`/setlist/tim/${setlist.id}`} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground">
            Admin belum membuat setlist tim.
          </p>
        )}
      </section>

      <section className="mt-8">
        <MySetlistList />
      </section>
    </>
  );
}
