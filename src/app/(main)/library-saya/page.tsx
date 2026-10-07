import type { Metadata } from "next";
import SavedSongList from "@/components/library/SavedSongList";
import { getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Library Saya",
};

export default async function LibrarySayaPage() {
  // daftar simpanan ada di HP, jadi kirim semua ringkasan lagu lalu disaring di browser
  const songs = await getSongs();

  return (
    <>
      <h1 className="text-2xl font-semibold">Library Saya</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Lagu yang kamu simpan. Tersimpan di HP ini saja.
      </p>
      <SavedSongList songs={songs} />
    </>
  );
}
