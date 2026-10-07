import type { Metadata } from "next";
import MySetlistDetail from "@/components/setlist/MySetlistDetail";
import { getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Setlist Saya",
};

export default async function MySetlistPage({ params }: PageProps<"/setlist/saya/[id]">) {
  const { id } = await params;
  // setlist pribadi ada di HP, jadi kirim ringkasan lagu lalu dicocokkan di browser
  const songs = await getSongs({ sort: "judul" });

  return <MySetlistDetail id={id} songs={songs} />;
}
