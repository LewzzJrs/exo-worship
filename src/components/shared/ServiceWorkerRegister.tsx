"use client";

import { useEffect } from "react";

// hanya aktif di versi online (production), supaya tidak mengganggu saat development
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker gagal didaftarkan:", error);
    });
  }, []);

  return null;
}
