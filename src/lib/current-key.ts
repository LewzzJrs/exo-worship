import { normalizeKey } from "@/lib/keys";

// key yang sedang dipilih di halaman lagu (disimpan SongViewer di URL ?key=)
export function getCurrentKey(originalKey: string) {
  const key = new URL(window.location.href).searchParams.get("key") ?? undefined;
  return normalizeKey(key, originalKey);
}
