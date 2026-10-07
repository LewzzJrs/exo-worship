"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/actions/stats";

// dicatat dari browser setelah halaman tampil, bukan saat link di-prefetch
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    recordView(slug);
  }, [slug]);

  return null;
}
