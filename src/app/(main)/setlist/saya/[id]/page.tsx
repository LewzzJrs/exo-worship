import type { Metadata } from "next";
import MySetlistDetail from "@/components/setlist/MySetlistDetail";
import { getSongFlows, getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Setlist Saya",
};

export default async function MySetlistPage({ params }: PageProps<"/setlist/saya/[id]">) {
  const { id } = await params;
  // setlist pribadi ada di HP, jadi kirim ringkasan lagu lalu dicocokkan di browser
  const [songs, songFlows] = await Promise.all([getSongs({ sort: "judul" }), getSongFlows()]);

  return <MySetlistDetail id={id} songs={songs} songFlows={songFlows} />;
}
