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
      }),
    )
    .max(30, "Maksimal 30 lagu per setlist"),
});

export type TeamSetlistValues = z.input<typeof teamSetlistSchema>;

export async function saveTeamSetlist(values: TeamSetlistValues, id?: string) {
  const admin = await requireAdminName();

  const parsed = teamSetlistSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const row = { ...parsed.data, updated_at: new Date().toISOString(), updated_by: admin };
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
