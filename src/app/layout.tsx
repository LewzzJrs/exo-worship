import Providers from "./providers";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import ServiceWorkerRegister from "@/components/shared/ServiceWorkerRegister";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

// font monospace untuk chord supaya posisinya pas di atas lirik
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Library chord dan aransemen lagu tim Exo Worship.",
  // aplikasi privat, jangan sampai muncul di Google
  robots: { index: false, follow: false },
  // tampilan saat dipasang di layar utama iPhone
  appleWebApp: {
    capable: true,
    title: "Exo Worship",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#e6e6e4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans")}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        {/* di atas supaya tidak menutupi navigasi bawah di HP */}
        <Toaster position="top-center" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
