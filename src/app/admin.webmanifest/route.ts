import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// aplikasi terpisah untuk admin: dari layar utama HP langsung masuk panel admin
export function GET() {
  const manifest: MetadataRoute.Manifest = {
    id: "/admin",
    name: "Exo Worship Admin",
    short_name: "Exo Admin",
    description: "Panel admin Exo Worship Library: kelola lagu, setlist tim, dan request.",
    lang: "id",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#e6e6e4",
    theme_color: "#e6e6e4",
    icons: [
      { src: "/icons/admin-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/admin-512.png", sizes: "512x512", type: "image/png" },
      // tulisan ada di tengah, jadi aman dipotong bulat oleh Android
      { src: "/icons/admin-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return Response.json(manifest, { headers: { "Content-Type": "application/manifest+json" } });
}
