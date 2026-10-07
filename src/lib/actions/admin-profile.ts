"use server";

import { AVATAR_BUCKET, avatarPath, ensureAvatarBucket } from "@/lib/avatars";
import { requireAdminName } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";

const MAX_BYTES = 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// admin hanya bisa mengganti foto profilnya sendiri (sesuai nama yang dipilih)
export async function uploadAdminPhoto(formData: FormData) {
  const admin = await requireAdminName();

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return { error: "Pilih foto dulu." };
  if (!ALLOWED_TYPES.includes(photo.type)) {
    return { error: "Format foto harus JPG, PNG, atau WebP." };
  }
  if (photo.size > MAX_BYTES) return { error: "Ukuran foto maksimal 1 MB." };

  try {
    await ensureAvatarBucket();
  } catch (error) {
    console.error("Gagal menyiapkan penyimpanan foto:", error);
    return { error: "Gagal menyimpan foto, coba lagi." };
  }

  const { error } = await getSupabase()
    .storage.from(AVATAR_BUCKET)
    .upload(avatarPath(admin), photo, { upsert: true, contentType: photo.type });
  if (error) {
    console.error("Gagal mengunggah foto profil:", error.message);
    return { error: "Gagal menyimpan foto, coba lagi." };
  }

  return { success: true };
}

export async function removeAdminPhoto() {
  const admin = await requireAdminName();

  const { error } = await getSupabase()
    .storage.from(AVATAR_BUCKET)
    .remove([avatarPath(admin)]);
  if (error && !/not found/i.test(error.message)) {
    console.error("Gagal menghapus foto profil:", error.message);
    return { error: "Gagal menghapus foto, coba lagi." };
  }

  return { success: true };
}
