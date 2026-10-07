import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, LockIcon } from "lucide-react";
import RecommendationEditor from "@/components/admin/RecommendationEditor";
import AdminAvatar from "@/components/shared/AdminAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RECOMMENDATION_ADMIN } from "@/lib/constants";
import { requireAdminName } from "@/lib/dal";
import {
  MONTH_PATTERN,
  currentMonth,
  formatMonth,
  getRecommendation,
  shiftMonth,
} from "@/lib/recommendations";
import { getSongs } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Rekomendasi Bulanan",
};

export default async function AdminRecommendationsPage({
  searchParams,
}: PageProps<"/admin/rekomendasi">) {
  const adminName = await requireAdminName();
  const { bulan } = await searchParams;
  const thisMonth = currentMonth();
  const month = typeof bulan === "string" && MONTH_PATTERN.test(bulan) ? bulan : thisMonth;
  const canEdit = adminName === RECOMMENDATION_ADMIN;

  const [recommendation, songs] = await Promise.all([
    getRecommendation(month),
    getSongs({ sort: "judul" }),
  ]);
  const slugs = recommendation?.slugs ?? [];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Rekomendasi bulanan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tampil di Beranda sebagai &quot;Rekomendasi bulan ini&quot;.
      </p>

      {/* pindah bulan, misalnya untuk menyiapkan rekomendasi bulan depan */}
      <div className="mt-5 flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="bg-card"
          aria-label="Bulan sebelumnya"
        >
          <Link href={`/admin/rekomendasi?bulan=${shiftMonth(month, -1)}`}>
            <ChevronLeftIcon />
          </Link>
        </Button>
        <p className="min-w-40 text-center font-semibold">{formatMonth(month)}</p>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="bg-card"
          aria-label="Bulan berikutnya"
        >
          <Link href={`/admin/rekomendasi?bulan=${shiftMonth(month, 1)}`}>
            <ChevronRightIcon />
          </Link>
        </Button>
        {month === thisMonth ? (
          <Badge variant="secondary">Bulan ini</Badge>
        ) : (
          <Link href="/admin/rekomendasi" className="text-sm underline underline-offset-4">
            Ke bulan ini
          </Link>
        )}
      </div>

      {recommendation && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <AdminAvatar name={recommendation.updatedBy} size="sm" />
          Terakhir diatur oleh {recommendation.updatedBy}
        </p>
      )}

      <div className="mt-6">
        {canEdit ? (
          // key bulan supaya isi editor ikut berganti saat pindah bulan
          <RecommendationEditor key={month} month={month} initialSlugs={slugs} songs={songs} />
        ) : (
          <>
            <p className="flex items-center gap-2 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              <LockIcon className="size-4 shrink-0" />
              Hanya {RECOMMENDATION_ADMIN} yang bisa mengatur lagu rekomendasi.
            </p>
            <ol className="mt-4 grid gap-3">
              {slugs
                .map((slug) => songs.find((song) => song.slug === slug))
                .filter((song) => song !== undefined)
                .map((song, index) => (
                  <li key={song.slug}>
                    <Card>
                      <CardContent className="flex items-center gap-3">
                        <span className="w-5 text-center font-semibold text-muted-foreground tabular-nums">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{song.title}</p>
                          <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
