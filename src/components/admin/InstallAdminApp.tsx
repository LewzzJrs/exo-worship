"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { DownloadIcon, SmartphoneIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// event khusus Chrome/Edge/Samsung Internet untuk memunculkan dialog pasang aplikasi
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const HIDE_KEY = "exo-admin-install-hidden";
const STANDALONE_QUERY = "(display-mode: standalone)";

function subscribeStandalone(onChange: () => void) {
  const query = window.matchMedia(STANDALONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// sudah dibuka dari layar utama (aplikasi terpasang)
function isStandalone() {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia(STANDALONE_QUERY).matches || iosStandalone === true;
}

// iPad baru mengaku sebagai Mac, jadi dicek juga dari layar sentuhnya
function isIos() {
  const { userAgent, maxTouchPoints } = navigator;
  return (
    /iphone|ipad|ipod/i.test(userAgent) || (/macintosh/i.test(userAgent) && maxTouchPoints > 1)
  );
}

function readHidden() {
  try {
    return localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};

// ajakan memasang panel admin di layar utama HP, terpisah dari aplikasi anggota
export default function InstallAdminApp() {
  // di server dianggap sudah terpasang, supaya kartu baru muncul setelah halaman aktif di browser
  const standalone = useSyncExternalStore(subscribeStandalone, isStandalone, () => true);
  const ios = useSyncExternalStore(noopSubscribe, isIos, () => false);
  const hiddenAtStart = useSyncExternalStore(noopSubscribe, readHidden, () => true);
  const [hidden, setHidden] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handlePrompt(event: Event) {
      // tahan dialog bawaan browser, dimunculkan lewat tombol Pasang
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function handleInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (standalone || hiddenAtStart || hidden) return null;

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") setInstalled(true);
  }

  function handleHide() {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      // penyimpanan diblokir, cukup disembunyikan sampai halaman dibuka lagi
    }
  }

  return (
    <Card className="mt-6">
      <CardContent className="flex items-start gap-3">
        <SmartphoneIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          <p className="font-medium">Pasang aplikasi admin di HP</p>
          {installed ? (
            <p className="text-muted-foreground">
              Sudah terpasang. Buka <strong className="text-foreground">Exo Admin</strong> dari
              layar utama HP.
            </p>
          ) : installEvent ? (
            <>
              <p className="text-muted-foreground">
                Panel admin bisa dibuka langsung dari layar utama, terpisah dari aplikasi anggota.
              </p>
              <Button size="sm" onClick={handleInstall}>
                <DownloadIcon />
                Pasang Exo Admin
              </Button>
            </>
          ) : ios ? (
            <p className="text-muted-foreground">
              Buka halaman ini di Safari, tekan tombol Bagikan (kotak dengan panah ke atas), lalu
              pilih <em>Tambah ke Layar Utama</em>. Setelah terpasang, masuk sekali lagi dengan
              password admin di aplikasinya.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Di Chrome, tekan menu ⋮ di kanan atas, lalu pilih <em>Instal aplikasi</em> atau{" "}
              <em>Tambahkan ke layar utama</em>. Aplikasinya bernama Exo Admin.
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Sembunyikan" onClick={handleHide}>
          <XIcon />
        </Button>
      </CardContent>
    </Card>
  );
}
