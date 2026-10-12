"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { requireAdminName } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import { setlistSchema } from "@/lib/validations/setlist";

const teamSetlistSchema = setlistSchema.extend({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        key: z.string().min(1).max(4),
        // catatan kosong tidak disimpan
        note: z
          .string()
          .trim()
          .max(120, "Catatan maksimal 120 karakter")
          .optional()
          .transform((note) => note || undefined),
        arrangement: z.string().max(15000, "Aransemen terlalu panjang").optional(),
        arrangementKey: z.string().max(4).optional(),
      }),
    )
    .max(30, "Maksimal 30 lagu per setlist"),
  // hanya dikirim kalau berubah; null berarti lembar gabungan dihapus
  combinedSheet: z.string().max(60000, "Lembar gabungan terlalu panjang").nullable().optional(),
});

export type TeamSetlistValues = z.input<typeof teamSetlistSchema>;

export async function saveTeamSetlist(values: TeamSetlistValues, id?: string) {
  const admin = await requireAdminName();

  const parsed = teamSetlistSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { combinedSheet, ...fields } = parsed.data;
  const row = {
    ...fields,
    updated_at: new Date().toISOString(),
    updated_by: admin,
    ...(combinedSheet !== undefined && {
      combined_sheet: combinedSheet?.trim() ? combinedSheet.replace(/\s+$/, "") : null,
    }),
  };
  const supabase = getSupabase();
  const { data, error } = id
    ? await supabase.from("team_setlists").update(row).eq("id", id).select("id").single()
    : await supabase
        .from("team_setlists")
        .insert({ ...row, created_by: admin })
        .select("id")
        .single();

  if (error) {
    console.error("Gagal menyimpan setlist tim:", error.message);
    if (error.message.includes("combined_sheet")) {
      return {
        error:
          "Database belum punya kolom lembar gabungan. Jalankan SQL terbaru dari supabase/schema.sql di Supabase.",
      };
    }
    return { error: "Gagal menyimpan setlist, coba lagi." };
  }

  await logActivity({
    admin,
    action: id ? "diubah" : "dibuat",
    entity: "setlist",
    entityId: data.id as string,
    entityTitle: parsed.data.name,
  });

  revalidatePath("/", "layout");
  return { id: data.id as string };
}

export async function deleteTeamSetlist(id: string) {
  const admin = await requireAdminName();

  const { data: deleted, error } = await getSupabase()
    .from("team_setlists")
    .delete()
    .eq("id", id)
    .select("name")
    .maybeSingle();
  if (error) {
    console.error("Gagal menghapus setlist tim:", error.message);
    return { error: "Gagal menghapus setlist, coba lagi." };
  }

  await logActivity({
    admin,
    action: "dihapus",
    entity: "setlist",
    entityId: id,
    entityTitle: deleted?.name ?? "Setlist",
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// isi lagu dari library, sebagai titik awal aransemen khusus setlist
export async function getSongForArrangement(slug: string) {
  await requireAdminName();

  const { data } = await getSupabase()
    .from("songs")
    .select("content, key")
    .eq("slug", slug)
    .maybeSingle();
  return data ? { content: data.content as string, key: data.key as string } : null;
}

// isi beberapa lagu dari library sekaligus, untuk membuat lembar gabungan setlist
export async function getSongsForSheet(slugs: string[]) {
  await requireAdminName();

  const { data } = await getSupabase()
    .from("songs")
    .select("slug, content, key")
    .in("slug", [...new Set(slugs)].slice(0, 30));
  return Object.fromEntries(
    (data ?? []).map((row) => [
      row.slug as string,
      { content: row.content as string, key: row.key as string },
    ]),
  );
}
