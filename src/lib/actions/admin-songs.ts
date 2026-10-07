"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { requireAdminName } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";
import { songSchema, type SongValues } from "@/lib/validations/song";

type SaveOptions = {
  // kosong berarti lagu baru
  slug?: string;
  // kalau lagu dibuat dari request, request-nya otomatis ditandai selesai
  requestId?: string;
};

// "Kau Setia (Live)" -> "kau-setia-live"
function slugify(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "lagu"
  );
}

async function createUniqueSlug(title: string) {
  const base = slugify(title);
  const { data } = await getSupabase().from("songs").select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((row) => row.slug as string));
  if (!taken.has(base)) return base;

  let number = 2;
  while (taken.has(`${base}-${number}`)) number++;
  return `${base}-${number}`;
}

export async function saveSong(values: SongValues, { slug, requestId }: SaveOptions = {}) {
  const admin = await requireAdminName();

  const parsed = songSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { title, artist, key, bpm, timeSignature, youtubeUrl, content } = parsed.data;
  const row = {
    title,
    artist,
    key,
    bpm: bpm ? Number(bpm) : null,
    time_signature: timeSignature || null,
    youtube_url: youtubeUrl || null,
    // baris kosong di akhir dibuang, spasi di awal baris chord tetap dijaga
    content: content.replace(/\r\n/g, "\n").replace(/\s+$/, ""),
    updated_at: new Date().toISOString(),
    updated_by: admin,
  };

  const supabase = getSupabase();
  const savedSlug = slug ?? (await createUniqueSlug(title));
  const { error } = slug
    ? await supabase.from("songs").update(row).eq("slug", slug)
    : await supabase.from("songs").insert({ ...row, slug: savedSlug, created_by: admin });

  if (error) {
    console.error("Gagal menyimpan lagu:", error.message);
    return { error: "Gagal menyimpan lagu, coba lagi." };
  }

  await logActivity({
    admin,
    action: slug ? "diubah" : "dibuat",
    entity: "lagu",
    entityId: savedSlug,
    entityTitle: title,
  });

  if (requestId) {
    await supabase
      .from("song_requests")
      .update({ status: "selesai", song_slug: savedSlug, updated_at: new Date().toISOString() })
      .eq("id", requestId);
  }

  revalidatePath("/", "layout");
  return { slug: savedSlug };
}

export async function deleteSong(slug: string) {
  const admin = await requireAdminName();
  const supabase = getSupabase();

  const { data: deleted, error } = await supabase
    .from("songs")
    .delete()
    .eq("slug", slug)
    .select("title")
    .maybeSingle();
  if (error) {
    console.error("Gagal menghapus lagu:", error.message);
    return { error: "Gagal menghapus lagu, coba lagi." };
  }

  // data suka dan view lagu ini tidak dipakai lagi, link di request juga dilepas
  await Promise.all([
    logActivity({
      admin,
      action: "dihapus",
      entity: "lagu",
      entityId: slug,
      entityTitle: deleted?.title ?? slug,
    }),
    supabase.from("song_likes").delete().eq("song_slug", slug),
    supabase.from("song_views").delete().eq("song_slug", slug),
    supabase.from("song_requests").update({ song_slug: null }).eq("song_slug", slug),
  ]);

  revalidatePath("/", "layout");
  return { success: true };
}
