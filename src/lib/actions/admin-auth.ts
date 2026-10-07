"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAccessToken, createAdminToken, isCorrectAdminPassword } from "@/lib/access-token";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  COOKIE_OPTIONS,
} from "@/lib/constants";
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

  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/masuk");
}
