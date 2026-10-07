import { cn } from "@/lib/utils";

type CopyrightFooterProps = {
  // jarak bawah; halaman anggota butuh ruang lebih untuk navigasi bawah di HP
  className?: string;
};

// hak cipta: sengaja kecil dan pudar supaya tidak menonjol
export default function CopyrightFooter({ className = "pb-6" }: CopyrightFooterProps) {
  return (
    <footer className={cn("text-center text-[11px] text-muted-foreground/60", className)}>
      © {new Date().getFullYear()} Lewi Maropo
    </footer>
  );
}
