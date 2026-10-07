"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MAX_RECOMMENDATIONS, RECOMMENDATION_ADMIN } from "@/lib/constants";
import { requireAdminName } from "@/lib/dal";
import { MONTH_PATTERN, recommendationKey } from "@/lib/recommendations";
import { getSupabase } from "@/lib/supabase";

const schema = z.object({
  month: z.string().regex(MONTH_PATTERN, "Bulan tidak valid"),
  slugs: z
    .array(z.string().min(1))
    .max(MAX_RECOMMENDATIONS, `Maksimal ${MAX_RECOMMENDATIONS} lagu rekomendasi`)
    .refine((slugs) => new Set(slugs).size === slugs.length, "Ada lagu yang dobel"),
});

export async function saveRecommendations(month: string, slugs: string[]) {
  const admin = await requireAdminName();
  if (admin !== RECOMMENDATION_ADMIN) {
    return { error: `Hanya ${RECOMMENDATION_ADMIN} yang bisa mengatur rekomendasi.` };
  }

  const parsed = schema.safeParse({ month, slugs });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getSupabase();
  const key = recommendationKey(parsed.data.month);
  const updatedAt = new Date().toISOString();

  // daftar kosong berarti rekomendasi bulan itu dihapus
  const { error } =
    parsed.data.slugs.length === 0
      ? await supabase.from("app_settings").delete().eq("key", key)
      : await supabase.from("app_settings").upsert({
          key,
          value: JSON.stringify({ slugs: parsed.data.slugs, updatedBy: admin, updatedAt }),
          updated_at: updatedAt,
        });

  if (error) {
    console.error("Gagal menyimpan rekomendasi:", error.message);
    return { error: "Gagal menyimpan rekomendasi, coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
