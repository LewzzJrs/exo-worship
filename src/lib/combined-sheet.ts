import { getSectionFlow } from "@/lib/chord-sheet";
import type { ShareSong } from "@/lib/setlist-utils";

// lembar gabungan setlist tim: semua lagu dalam satu teks yang bisa diedit bebas (misalnya medley).
// setiap lagu diawali baris judul seperti:
//   == KumilikMu | Key G ==
// pindah key di tengah lagu cukup ditulis:
//   == Key A ==

export type SheetPart = {
  // kosong kalau baris judulnya hanya pindah key, atau teks sebelum judul pertama
  title: string | null;
  // baris "== Key A ==" tanpa judul
  isKeyChange: boolean;
  key: string | null;
  content: string;
};

export type SheetEntry = {
  title: string;
  key: string;
  note?: string;
  content: string;
};

const HEADER_LINE = /^\s*==(.*)==\s*$/;
const KEY_PIECE = /^key\s*[:=]?\s*([A-Ga-g][#b]?m?)$/i;

// huruf besar/kecil key dirapikan: "f#m" jadi "F#m", "bb" jadi "Bb"
function normalizeKey(key: string) {
  return key[0].toUpperCase() + key.slice(1).replace("M", "m");
}

function parseHeader(inner: string) {
  let title: string | null = null;
  let key: string | null = null;
  for (const piece of inner.split("|").map((text) => text.trim())) {
    const keyMatch = piece.match(KEY_PIECE);
    if (keyMatch) key = normalizeKey(keyMatch[1]);
    else if (piece) title = piece;
  }
  return { title, key };
}

// pecah lembar gabungan per lagu; teks sebelum judul pertama memakai fallbackKey
export function parseCombinedSheet(text: string, fallbackKey: string | null): SheetPart[] {
  const parts: SheetPart[] = [];
  let current = {
    title: null as string | null,
    isKeyChange: false,
    key: fallbackKey,
    lines: [] as string[],
  };

  const pushCurrent = () => {
    const content = current.lines.join("\n");
    if (current.title || content.trim()) {
      parts.push({
        title: current.title,
        isKeyChange: current.isKeyChange,
        key: current.key,
        content,
      });
    }
  };

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(HEADER_LINE);
    if (!match) {
      current.lines.push(line);
      continue;
    }
    pushCurrent();
    const header = parseHeader(match[1]);
    // judul tanpa key meneruskan key sebelumnya
    current = {
      title: header.title,
      isKeyChange: !header.title && header.key !== null,
      key: header.key ?? current.key,
      lines: [],
    };
  }
  pushCurrent();
  return parts;
}

// isi awal lembar gabungan dari daftar lagu setlist
export function buildCombinedSheet(entries: SheetEntry[]) {
  return entries
    .map((entry) =>
      [
        `== ${entry.title.replaceAll("|", "/").replaceAll("==", "=")} | Key ${entry.key} ==`,
        entry.note ? `Catatan: ${entry.note}` : null,
        entry.content.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

// daftar lagu untuk teks share WhatsApp, mengikuti urutan medley di lembar gabungan.
// pindah key ditulis di urutan lagu sebelumnya, misalnya "Chorus, → Key A, Chorus"
export function combinedSheetShareSongs(text: string, fallbackKey: string | null): ShareSong[] {
  const songs: ShareSong[] = [];
  for (const part of parseCombinedSheet(text, fallbackKey)) {
    const flow = getSectionFlow(part.content);
    const previous = songs.at(-1);
    if (part.title || !previous) {
      songs.push({ title: part.title ?? "Pembuka", key: part.key ?? "-", flow });
    } else {
      previous.flow = [...(previous.flow ?? []), `→ Key ${part.key}`, ...flow];
    }
  }
  return songs;
}
