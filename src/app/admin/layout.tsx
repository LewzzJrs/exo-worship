import type { Metadata } from "next";

// semua halaman admin memakai manifest dan ikon sendiri,
// jadi bisa dipasang di layar utama sebagai aplikasi terpisah dari aplikasi anggota
export const metadata: Metadata = {
  manifest: "/admin.webmanifest",
  icons: {
    icon: { url: "/icons/admin-192.png", sizes: "192x192", type: "image/png" },
    apple: { url: "/icons/admin-apple.png", sizes: "180x180", type: "image/png" },
  },
  appleWebApp: {
    capable: true,
    title: "Exo Admin",
    statusBarStyle: "default",
  },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
