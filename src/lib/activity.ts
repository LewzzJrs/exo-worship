import "server-only";

import type { AdminName } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";

export type ActivityAction = "dibuat" | "diubah" | "dihapus";
export type ActivityEntity = "lagu" | "setlist";

type ActivityInput = {
  admin: AdminName;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  entityTitle: string;
};

// catat ke riwayat admin; kalau gagal cukup ditulis di log, simpanan utama tetap jalan
export async function logActivity({ admin, action, entity, entityId, entityTitle }: ActivityInput) {
  const { error } = await getSupabase().from("admin_activity").insert({
    admin_name: admin,
    action,
    entity,
    entity_id: entityId,
    entity_title: entityTitle,
  });
  if (error) console.error("Gagal mencatat riwayat admin:", error.message);
}
