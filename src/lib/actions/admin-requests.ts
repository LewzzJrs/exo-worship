"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";

const updateSchema = z.object({
  status: z.enum(["menunggu", "diproses", "selesai", "ditolak"]),
  songSlug: z.string().nullable(),
});

export async function updateRequest(id: string, values: z.infer<typeof updateSchema>) {
  await verifyAdmin();

  const parsed = updateSchema.safeParse(values);
  if (!parsed.success) return { error: "Status tidak valid" };

  const { error } = await getSupabase()
    .from("song_requests")
    .update({
      status: parsed.data.status,
      // link lagu hanya disimpan kalau statusnya selesai
      song_slug: parsed.data.status === "selesai" ? parsed.data.songSlug : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Gagal mengubah request:", error.message);
    return { error: "Gagal menyimpan, coba lagi." };
  }

  refresh();
  return { success: true };
}

export async function deleteRequest(id: string) {
  await verifyAdmin();

  const { error } = await getSupabase().from("song_requests").delete().eq("id", id);
  if (error) {
    console.error("Gagal menghapus request:", error.message);
    return { error: "Gagal menghapus, coba lagi." };
  }

  refresh();
  return { success: true };
}
