import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  ADMIN_COOKIE,
  ADMIN_NAME_COOKIE,
  DEVICE_COOKIE,
  isAdminName,
} from "@/lib/constants";
import { isValidAccessToken, isValidAdminToken } from "@/lib/access-token";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isAdmin = cache(async () => {
  return isValidAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
});

// cek ulang di dekat data, jangan hanya mengandalkan proxy.
// admin juga boleh membaca data anggota
export const verifyAccess = cache(async () => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;

  if (!(await isValidAccessToken(token)) && !(await isAdmin())) {
    redirect("/masuk");
  }
});

export const verifyAdmin = cache(async () => {
  if (!(await isAdmin())) {
    redirect("/admin/masuk");
  }
});

// nama admin yang sedang dipakai, null kalau belum memilih
export const getAdminName = cache(async () => {
  const name = (await cookies()).get(ADMIN_NAME_COOKIE)?.value;
  return isAdminName(name) ? name : null;
});

// untuk aksi yang tercatat di riwayat: harus admin dan sudah memilih nama
export const requireAdminName = cache(async () => {
  await verifyAdmin();
  const name = await getAdminName();
  if (!name) redirect("/admin/pilih-nama");
  return name;
});

// ID perangkat dibuat oleh proxy, null kalau cookie tidak ada atau formatnya aneh
export const getDeviceId = cache(async () => {
  const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value;
  return deviceId && UUID_PATTERN.test(deviceId) ? deviceId : null;
});
