import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ChordSheetDocument, type PdfSong } from "@/components/pdf/ChordSheetDocument";
import { verifyAccess } from "@/lib/dal";
import { normalizeKey } from "@/lib/keys";
import { parsePdfOptions } from "@/lib/pdf-options";
import { getTeamSetlist } from "@/lib/setlists";
import { getSongBySlug } from "@/lib/songs";
import type { SetlistItem } from "@/types/setlist";

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

function parseSongsParam(songsParam: string): SetlistItem[] {
  return songsParam
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
}

// lagu dari library, atau aransemen khusus setlist kalau ada
async function toPdfSongs(items: SetlistItem[]) {
  const pdfSongs: PdfSong[] = [];
  for (const item of items) {
    const song = await getSongBySlug(item.slug);
    if (!song) continue;

    if (item.arrangement) {
      const arrangementKey = item.arrangementKey ?? item.key;
      pdfSongs.push({
        song: { ...song, content: item.arrangement, key: arrangementKey },
        key: normalizeKey(item.key, arrangementKey),
        note: item.note,
        arranged: true,
      });
    } else {
      pdfSongs.push({ song, key: normalizeKey(item.key, song.key), note: item.note });
    }
  }
  return pdfSongs;
}

export async function GET(request: NextRequest) {
  await verifyAccess();
  const searchParams = request.nextUrl.searchParams;

  let pdfSongs: PdfSong[];
  let name: string | undefined;
  let date: string | undefined;

  // setlist tim dibaca langsung dari database, supaya aransemen khususnya ikut
  const setlistId = searchParams.get("setlist");
  if (setlistId) {
    const setlist = await getTeamSetlist(setlistId);
    if (!setlist) return new Response("Setlist tidak ditemukan", { status: 404 });
    pdfSongs = await toPdfSongs(setlist.items.slice(0, MAX_SONGS));
    name = setlist.name;
    date = setlist.date;
  } else {
    const parsed = querySchema.safeParse({
      songs: searchParams.get("songs") ?? "",
      name: searchParams.get("name") || undefined,
      date: searchParams.get("date") || undefined,
    });
    if (!parsed.success) {
      return new Response("Permintaan PDF tidak valid", { status: 400 });
    }
    pdfSongs = await toPdfSongs(parseSongsParam(parsed.data.songs));
    name = parsed.data.name;
    date = parsed.data.date;
  }

  if (pdfSongs.length === 0) {
    return new Response("Lagu tidak ditemukan", { status: 404 });
  }

  // pilihan font, ukuran, dan jenis chord dari dialog preview
  const options = parsePdfOptions(searchParams);
  const buffer = await renderToBuffer(ChordSheetDocument({ songs: pdfSongs, name, date, options }));

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
