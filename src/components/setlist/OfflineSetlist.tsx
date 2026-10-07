"use client";

import { useEffect, useState } from "react";
import { CloudOffIcon } from "lucide-react";

// simpan semua lagu di setlist ke HP, supaya tetap bisa dibuka tanpa sinyal saat ibadah
export default function OfflineSetlist({ urls }: { urls: string[] }) {
  const [saved, setSaved] = useState<number | null>(null);
  const urlsKey = urls.join("|");

  useEffect(() => {
    const worker = navigator.serviceWorker?.controller;
    if (!worker || !urlsKey) return;

    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => setSaved(event.data.saved);
    worker.postMessage({ type: "CACHE_PAGES", urls: urlsKey.split("|") }, [channel.port2]);
    return () => channel.port1.close();
  }, [urlsKey]);

  if (!saved) return null;

  return (
    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
      <CloudOffIcon className="size-3.5" />
      {saved} lagu tersimpan, bisa dibuka tanpa sinyal di HP ini.
    </p>
  );
}
