"use server";

import { cookies } from "next/headers";
import {
  TEAM_CODE_SETTING,
  clearTeamCodeCache,
  createAccessToken,
  hashTeamCode,
} from "@/lib/access-token";
import { ACCESS_COOKIE, ACCESS_MAX_AGE, COOKIE_OPTIONS } from "@/lib/constants";
import { verifyAdmin } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import { teamCodeSchema, type TeamCodeValues } from "@/lib/validations/admin";

export async function changeTeamCode(values: TeamCodeValues) {
  await verifyAdmin();

  const parsed = teamCodeSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // yang disimpan hanya hash-nya, kode aslinya tidak pernah masuk database
  const hash = await hashTeamCode(parsed.data.code);
  const { error } = await getSupabase()
    .from("app_settings")
    .upsert({ key: TEAM_CODE_SETTING, value: hash, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Gagal mengganti kode akses:", error.message);
    return { error: "Gagal mengganti kode, coba lagi." };
  }

  clearTeamCodeCache();
  // admin yang mengganti kode tidak perlu ikut masuk ulang
  (await cookies()).set(ACCESS_COOKIE, await createAccessToken(hash), {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });

  return { success: true };
}
