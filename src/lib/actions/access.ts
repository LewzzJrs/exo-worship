"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, ACCESS_MAX_AGE } from "@/lib/constants";
import { createAccessToken, isCorrectCode } from "@/lib/access-token";
import { accessSchema, type AccessValues } from "@/lib/validations/access";

// hanya izinkan path di dalam aplikasi, supaya tidak bisa diarahkan ke situs lain
function safeNextPath(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}

export async function enterAccessCode(values: AccessValues, next?: string) {
  const parsed = accessSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (!(await isCorrectCode(parsed.data.code))) {
    // jeda kecil supaya tebak-tebakan kode jadi lambat
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "Kode akses salah. Tanyakan kode terbaru ke admin tim." };
  }

  (await cookies()).set(ACCESS_COOKIE, await createAccessToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });

  redirect(safeNextPath(next));
}
