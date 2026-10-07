import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // file font PDF dibaca saat runtime, jadi harus ikut terbawa ke server (Vercel)
  outputFileTracingIncludes: {
    "/api/pdf": ["./src/fonts/**/*"],
  },
  // service worker selalu diambil versi terbaru (sesuai panduan PWA Next.js)
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
