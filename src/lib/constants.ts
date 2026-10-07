export const APP_NAME = "Exo Worship Library";

export const ACCESS_COOKIE = "exo_akses";

// cookie akses berlaku 180 hari, setelah itu anggota masukkan kode lagi
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 180;

// ID acak per HP, pengganti akun untuk menghitung suka, trending, dan request
export const DEVICE_COOKIE = "exo_perangkat";
export const DEVICE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

// sesi admin lebih pendek dari anggota
export const ADMIN_COOKIE = "exo_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 30;

const isProduction = process.env.NODE_ENV === "production";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
} as const;

// nama admin yang bisa dipilih setelah masuk, untuk mencatat siapa membuat atau mengubah data
export const ADMIN_NAMES = ["Vesah", "Ester", "Lewi"] as const;
export type AdminName = (typeof ADMIN_NAMES)[number];
export const ADMIN_NAME_COOKIE = "exo_admin_nama";

export function isAdminName(name: string | undefined): name is AdminName {
  return ADMIN_NAMES.includes(name as AdminName);
}
