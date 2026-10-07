import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// minta konfirmasi sebelum meninggalkan halaman yang masih punya perubahan belum disimpan
export function useLeaveConfirmation(hasUnsavedChanges: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // tutup tab, muat ulang, atau buka alamat lain: pakai dialog bawaan browser
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    // klik link di dalam aplikasi: tahan dulu, lalu tampilkan dialog konfirmasi
    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    // fase capture supaya jalan sebelum navigasi bawaan Next.js
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [hasUnsavedChanges]);

  return {
    pendingHref,
    stay: () => setPendingHref(null),
    leave: () => {
      if (pendingHref) router.push(pendingHref);
      setPendingHref(null);
    },
  };
}
