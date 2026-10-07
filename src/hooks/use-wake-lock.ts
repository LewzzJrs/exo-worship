import { useEffect, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};

// layar HP tidak mati sendiri selama aktif (tidak semua browser mendukung)
export function useWakeLock() {
  const isSupported = useSyncExternalStore(
    subscribe,
    () => "wakeLock" in navigator,
    () => false,
  );
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || !isSupported) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function request() {
      try {
        sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) sentinel.release();
      } catch {
        // ditolak browser, misalnya mode hemat baterai
        setIsActive(false);
      }
    }

    // kunci otomatis lepas saat pindah aplikasi, jadi diminta lagi saat kembali
    function handleVisibility() {
      if (document.visibilityState === "visible") request();
    }

    request();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      sentinel?.release();
    };
  }, [isActive, isSupported]);

  return { isSupported, isActive, setIsActive };
}
