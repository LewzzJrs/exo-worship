import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ChordSheetDocument, type PdfSong } from "@/components/pdf/ChordSheetDocument";
import { verifyAccess } from "@/lib/dal";
import { normalizeKey } from "@/lib/keys";
import { getSongBySlug } from "@/lib/songs";

const MAX_SONGS = 30;

const querySchema = z.object({
  // slug:key:catatan,slug:key (catatan di-encode)
  songs: z.string().min(1).max(8000),
  name: z.string().trim().max(60).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// nama file aman untuk header (tanpa tanda kutip dan huruf aneh)
function toFilename(text: string) {
  return text
    .replace(/[^\w\s().#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: NextRequest) {
  await verifyAccess();

  const searchParams = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    songs: searchParams.get("songs") ?? "",
    name: searchParams.get("name") || undefined,
    date: searchParams.get("date") || undefined,
  });
  if (!parsed.success) {
    return new Response("Permintaan PDF tidak valid", { status: 400 });
  }

  const { songs: songsParam, name, date } = parsed.data;
  const entries = songsParam
    .split(",")
    .slice(0, MAX_SONGS)
    .map((entry) => {
      const [slug, key, note] = entry.split(":");
      let decodedNote: string | undefined;
      try {
        decodedNote = note ? decodeURIComponent(note).slice(0, 120) : undefined;
      } catch {
        // catatan rusak diabaikan saja
      }
      return { slug, key, note: decodedNote };
    });

  const pdfSongs: PdfSong[] = [];
  for (const entry of entries) {
    const song = await getSongBySlug(entry.slug);
    if (song) pdfSongs.push({ song, key: normalizeKey(entry.key, song.key), note: entry.note });
  }
  if (pdfSongs.length === 0) {
    return new Response("Lagu tidak ditemukan", { status: 404 });
  }

  const buffer = await renderToBuffer(ChordSheetDocument({ songs: pdfSongs, name, date }));

  const first = pdfSongs[0];
  const filename = name
    ? `Setlist ${name}${date ? ` ${date}` : ""}.pdf`
    : `${first.song.title} (${first.key}).pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${toFilename(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
