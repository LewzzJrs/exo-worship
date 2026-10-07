import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/exo-logo.svg"
      alt="Exo Worship"
      width={900}
      height={320}
      priority
      className={cn("h-10 w-auto", className)}
    />
  );
}
