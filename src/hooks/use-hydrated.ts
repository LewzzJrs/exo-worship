import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false saat render di server, true setelah halaman aktif di browser.
// dipakai untuk data dari localStorage supaya tidak bentrok dengan HTML dari server
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
