"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAccessToken, createAdminToken, isCorrectAdminPassword } from "@/lib/access-token";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  ADMIN_NAME_COOKIE,
  COOKIE_OPTIONS,
  isAdminName,
} from "@/lib/constants";
import { verifyAdmin } from "@/lib/dal";
import { adminLoginSchema, type AdminLoginValues } from "@/lib/validations/admin";

export async function adminLogin(values: AdminLoginValues) {
  const parsed = adminLoginSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (!(await isCorrectAdminPassword(parsed.data.password))) {
    // jeda kecil supaya tebak-tebakan password jadi lambat
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: "Password salah." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, await createAdminToken(), {
    ...COOKIE_OPTIONS,
    maxAge: ADMIN_MAX_AGE,
  });
  // admin sekaligus bisa membuka halaman anggota
  cookieStore.set(ACCESS_COOKIE, await createAccessToken(), {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });

  redirect("/admin/pilih-nama");
}

// nama dipakai untuk mencatat siapa yang membuat atau mengubah lagu dan setlist
export async function chooseAdminName(name: string) {
  await verifyAdmin();
  if (!isAdminName(name)) return { error: "Nama admin tidak dikenal." };

  (await cookies()).set(ADMIN_NAME_COOKIE, name, { ...COOKIE_OPTIONS, maxAge: ADMIN_MAX_AGE });
  redirect("/admin");
}

// keluar dari profil saja: sesi admin tetap, kembali ke pilihan nama tanpa password
export async function leaveAdminProfile() {
  (await cookies()).delete(ADMIN_NAME_COOKIE);
  redirect("/admin/pilih-nama");
}

// keluar sepenuhnya: harus memasukkan password admin lagi
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  cookieStore.delete(ADMIN_NAME_COOKIE);
  redirect("/admin/masuk");
}
