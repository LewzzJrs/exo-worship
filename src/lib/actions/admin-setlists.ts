"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import { setlistSchema } from "@/lib/validations/setlist";

const teamSetlistSchema = setlistSchema.extend({
  items: z
    .array(z.object({ slug: z.string().min(1), key: z.string().min(1).max(4) }))
    .max(30, "Maksimal 30 lagu per setlist"),
});

export type TeamSetlistValues = z.infer<typeof teamSetlistSchema>;

export async function saveTeamSetlist(values: TeamSetlistValues, id?: string) {
  await verifyAdmin();

  const parsed = teamSetlistSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const row = { ...parsed.data, updated_at: new Date().toISOString() };
  const supabase = getSupabase();
  const { data, error } = id
    ? await supabase.from("team_setlists").update(row).eq("id", id).select("id").single()
    : await supabase.from("team_setlists").insert(row).select("id").single();

  if (error) {
    console.error("Gagal menyimpan setlist tim:", error.message);
    return { error: "Gagal menyimpan setlist, coba lagi." };
  }

  revalidatePath("/", "layout");
  return { id: data.id as string };
}

export async function deleteTeamSetlist(id: string) {
  await verifyAdmin();

  const { error } = await getSupabase().from("team_setlists").delete().eq("id", id);
  if (error) {
    console.error("Gagal menghapus setlist tim:", error.message);
    return { error: "Gagal menghapus setlist, coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
