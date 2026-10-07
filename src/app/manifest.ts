import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/constants";

// supaya aplikasi bisa dipasang di layar utama HP seperti aplikasi biasa
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "Exo Worship",
    description: "Library chord dan aransemen lagu tim Exo Worship.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e6e6e4",
    theme_color: "#e6e6e4",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      // tulisan ada di tengah, jadi aman dipotong bulat oleh Android
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
