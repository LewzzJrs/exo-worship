// dipakai proxy dan server, jadi hanya pakai Web Crypto dan fetch (tanpa modul khusus Node)

const encoder = new TextEncoder();

export const TEAM_CODE_SETTING = "team_code_hash";

function getEnv(name: "TEAM_ACCESS_CODE" | "SESSION_SECRET" | "ADMIN_PASSWORD") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi di .env.local`);
  return value;
}

// kode tidak membedakan huruf besar/kecil supaya mudah diketik di HP
function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getEnv("SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --- kode akses tim ---

export function hashTeamCode(code: string) {
  return sign(`kode:${normalizeCode(code)}`);
}

// kode yang diganti admin disimpan di Supabase, dibaca ulang paling lama tiap 15 detik
const CACHE_MS = 15_000;
let cachedHash: { value: string; expiresAt: number } | undefined;

async function fetchStoredTeamCodeHash() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;

  const response = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/app_settings?select=value&key=eq.${TEAM_CODE_SETTING}`,
    { headers: { apikey: secretKey }, cache: "no-store" },
  );
  if (!response.ok) throw new Error(`Gagal membaca kode akses (${response.status})`);
  const rows = (await response.json()) as { value: string }[];
  return rows[0]?.value ?? null;
}

export async function getTeamCodeHash() {
  if (cachedHash && cachedHash.expiresAt > Date.now()) return cachedHash.value;

  try {
    // belum pernah diganti admin: pakai kode awal dari .env.local
    const value =
      (await fetchStoredTeamCodeHash()) ?? (await hashTeamCode(getEnv("TEAM_ACCESS_CODE")));
    cachedHash = { value, expiresAt: Date.now() + CACHE_MS };
    return value;
  } catch (error) {
    // database sedang bermasalah: pakai nilai terakhir supaya kode lama tidak hidup lagi
    if (cachedHash) return cachedHash.value;
    console.error(error);
    return hashTeamCode(getEnv("TEAM_ACCESS_CODE"));
  }
}

export function clearTeamCodeCache() {
  cachedHash = undefined;
}

export async function isCorrectCode(input: string) {
  const [given, expected] = await Promise.all([hashTeamCode(input), getTeamCodeHash()]);
  return safeEqual(given, expected);
}

// token ikut berubah kalau kode akses diganti, jadi semua HP harus masuk ulang
export async function createAccessToken(teamCodeHash?: string) {
  return sign(`akses:${teamCodeHash ?? (await getTeamCodeHash())}`);
}

export async function isValidAccessToken(token: string | undefined) {
  if (!token) return false;
  return safeEqual(token, await createAccessToken());
}

// --- admin ---

export async function isCorrectAdminPassword(input: string) {
  const [given, expected] = await Promise.all([
    sign(`password:${input}`),
    sign(`password:${getEnv("ADMIN_PASSWORD")}`),
  ]);
  return safeEqual(given, expected);
}

// token admin ikut berubah kalau ADMIN_PASSWORD diganti
export async function createAdminToken() {
  return sign(`admin:${await sign(`password:${getEnv("ADMIN_PASSWORD")}`)}`);
}

export async function isValidAdminToken(token: string | undefined) {
  if (!token) return false;
  return safeEqual(token, await createAdminToken());
}
