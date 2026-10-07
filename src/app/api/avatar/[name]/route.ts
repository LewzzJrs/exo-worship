import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { AVATAR_BUCKET, avatarPath } from "@/lib/avatars";
import { isAdminName } from "@/lib/constants";
import { verifyAccess } from "@/lib/dal";
import { getSupabase } from "@/lib/supabase";

// selalu dicek ulang ke server (pakai ETag), jadi foto baru langsung terlihat
const CACHE_HEADERS = { "Cache-Control": "private, no-cache" };

export async function GET(request: NextRequest, ctx: RouteContext<"/api/avatar/[name]">) {
  await verifyAccess();

  const { name } = await ctx.params;
  if (!isAdminName(name)) return new Response(null, { status: 404, headers: CACHE_HEADERS });

  // belum ada foto: browser menampilkan inisial nama sebagai gantinya
  const { data, error } = await getSupabase()
    .storage.from(AVATAR_BUCKET)
    .download(avatarPath(name));
  if (error || !data) return new Response(null, { status: 404, headers: CACHE_HEADERS });

  const bytes = new Uint8Array(await data.arrayBuffer());
  const etag = `"${createHash("sha1").update(bytes).digest("hex")}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ...CACHE_HEADERS, ETag: etag } });
  }

  return new Response(bytes, {
    headers: { ...CACHE_HEADERS, ETag: etag, "Content-Type": data.type || "image/jpeg" },
  });
}
