"use client";

import { useState } from "react";
import { UserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvatarStore } from "@/store/avatar";

// warna khas tiap admin, dipakai kalau belum ada foto profil
const ADMIN_COLORS: Record<string, string> = {
  Vesah: "bg-violet-600",
  Ester: "bg-rose-600",
  Lewi: "bg-sky-600",
};

const SIZES = {
  sm: "size-5 text-[10px]",
  md: "size-9 text-sm",
  lg: "size-16 text-2xl",
  xl: "size-24 text-4xl",
};

type AdminAvatarProps = {
  // kosong untuk data lama yang pembuatnya tidak tercatat
  name?: string;
  size?: keyof typeof SIZES;
  className?: string;
};

export default function AdminAvatar({ name, size = "md", className }: AdminAvatarProps) {
  const version = useAvatarStore((state) => state.version);
  // foto yang gagal dimuat (belum diunggah) diingat per versi, supaya foto baru dicoba lagi
  const [failedVersion, setFailedVersion] = useState<number | null>(null);
  const showPhoto = !!name && failedVersion !== version;

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white",
        SIZES[size],
        name ? (ADMIN_COLORS[name] ?? "bg-neutral-600") : "bg-neutral-300",
        className,
      )}
    >
      {name ? name.charAt(0).toUpperCase() : <UserRoundIcon className="size-1/2" />}
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element -- foto privat lewat route sendiri, tidak lewat optimasi gambar
        <img
          src={`/api/avatar/${encodeURIComponent(name)}${version ? `?v=${version}` : ""}`}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedVersion(version)}
        />
      )}
    </span>
  );
}
