import { Skeleton } from "@/components/ui/skeleton";

// kerangka halaman saat pindah menu, supaya setiap tap langsung terlihat ada respons
// sementara data dari server masih dimuat
export default function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Memuat halaman">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      <div className="mt-6 grid gap-3">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/5"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
