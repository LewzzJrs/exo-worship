import "server-only";

import type { AdminName } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";

// foto profil admin disimpan di Supabase Storage (privat), dibaca lewat /api/avatar/[nama]
export const AVATAR_BUCKET = "avatars";

export function avatarPath(name: AdminName) {
  return `admins/${name}.jpg`;
}

// bucket dibuat otomatis saat pertama kali ada yang mengunggah foto
export async function ensureAvatarBucket() {
  const storage = getSupabase().storage;
  const { error } = await storage.getBucket(AVATAR_BUCKET);
  if (!error) return;

  const { error: createError } = await storage.createBucket(AVATAR_BUCKET, {
    public: false,
    fileSizeLimit: "1MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (createError && !/already exists/i.test(createError.message)) throw createError;
}
