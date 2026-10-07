import { useEffect, useMemo, useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";

// draft editan disimpan otomatis di perangkat ini (localStorage),
// supaya perubahan yang belum disimpan tidak hilang kalau halaman tertutup

export type Draft<T> = {
  values: T;
  savedAt: string;
};

const PREFIX = "exo-draft:";

function readDraft<T>(key: string): Draft<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Draft<T>) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // penyimpanan browser tidak bisa dipakai, abaikan
  }
}

// draft yang sudah ada saat halaman dibuka (sebelum mulai mengetik lagi)
export function useInitialDraft<T>(key: string) {
  const isHydrated = useHydrated();
  return useMemo(() => (isHydrated ? readDraft<T>(key) : null), [isHydrated, key]);
}

// simpan draft otomatis sebentar setelah berhenti mengetik, hanya kalau ada perubahan
export function useDraftAutosave<T>(key: string, values: T, enabled: boolean) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const serialized = JSON.stringify(values);

  useEffect(() => {
    if (!enabled) return;
    const timeout = setTimeout(() => {
      const savedAt = new Date().toISOString();
      try {
        localStorage.setItem(
          PREFIX + key,
          JSON.stringify({ values: JSON.parse(serialized), savedAt }),
        );
        setLastSavedAt(savedAt);
      } catch {
        // penyimpanan penuh atau diblokir, draft dilewati
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [key, serialized, enabled]);

  return lastSavedAt;
}
