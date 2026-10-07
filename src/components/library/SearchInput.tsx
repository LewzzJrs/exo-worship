"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  defaultValue?: string;
  // halaman yang menampilkan hasil pencarian
  path?: string;
};

export default function SearchInput({ defaultValue, path = "/library" }: SearchInputProps) {
  const router = useRouter();
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  function handleChange(value: string) {
    clearTimeout(timeout.current);
    // tunggu sebentar setelah berhenti mengetik, baru cari
    timeout.current = setTimeout(() => {
      const query = value.trim();
      router.replace(query ? `${path}?q=${encodeURIComponent(query)}` : path, {
        scroll: false,
      });
    }, 300);
  }

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cari judul, artis, atau potongan lirik"
        aria-label="Cari lagu"
        defaultValue={defaultValue}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 bg-card pl-9"
      />
    </div>
  );
}
