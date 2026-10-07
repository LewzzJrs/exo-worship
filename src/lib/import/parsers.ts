import "server-only";

import JSZip from "jszip";
import mammoth from "mammoth";
import { extractTextItems } from "unpdf";
import { isChordLine, isSectionLabel, normalizeImportedText } from "@/lib/import/normalize";

// --- Word (.docx) ---

export async function parseDocx(buffer: Buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  // mammoth memisahkan paragraf dengan baris kosong, padahal tiap paragraf = satu baris lagu
  return normalizeImportedText(value.replace(/\n\n/g, "\n"));
}

// --- PowerPoint (.pptx), juga dipakai untuk Google Slides ---

function decodeXml(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&");
}

function slideText(xml: string) {
  const lines: string[] = [];
  for (const paragraph of xml.match(/<a:p>[\s\S]*?<\/a:p>|<a:p\/>/g) ?? []) {
    let text = "";
    for (const token of paragraph.match(/<a:t>[\s\S]*?<\/a:t>|<a:br\/>|<a:tab\/>/g) ?? []) {
      if (token === "<a:br/>") text += "\n";
      else if (token === "<a:tab/>") text += "    ";
      else text += decodeXml(token.slice(5, -6));
    }
    lines.push(...text.split("\n"));
  }
  return lines;
}

// urutan slide diambil dari presentation.xml, bukan dari nomor file
async function orderedSlidePaths(zip: JSZip) {
  const presentation = await zip.file("ppt/presentation.xml")?.async("string");
  const rels = await zip.file("ppt/_rels/presentation.xml.rels")?.async("string");
  const fallback = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => Number(a.match(/\d+/g)?.pop()) - Number(b.match(/\d+/g)?.pop()));
  if (!presentation || !rels) return fallback;

  const targets = new Map(
    [...rels.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((match) => [
      match[1],
      `ppt/${match[2].replace(/^\/?ppt\//, "")}`,
    ]),
  );
  const ordered = [...presentation.matchAll(/<p:sldId [^>]*r:id="([^"]+)"/g)]
    .map((match) => targets.get(match[1]))
    .filter((path): path is string => !!path && !!zip.file(path));
  return ordered.length > 0 ? ordered : fallback;
}

export async function parsePptx(buffer: Buffer | ArrayBuffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slides: string[][] = [];

  for (const path of await orderedSlidePaths(zip)) {
    const lines = slideText((await zip.file(path)?.async("string")) ?? "");
    const trimmed = lines.join("\n").replace(/^\s*\n|\n\s*$/g, "");
    if (trimmed.trim()) slides.push(trimmed.split("\n"));
  }

  // slide pertama yang pendek tanpa chord biasanya slide judul: "Judul" + "Artis"
  let title: string | undefined;
  let artist: string | undefined;
  const first = slides[0];
  if (first && first.length <= 3 && !first.some(isChordLine) && slides.length > 1) {
    [title, artist] = first.map((line) => line.trim()).filter(Boolean);
    slides.shift();
  }

  // tiap slide jadi satu bagian; kalau baris pertamanya bukan label, beri label sementara
  const text = slides
    .map((lines, index) => (isSectionLabel(lines[0]) ? lines : [`[Bagian ${index + 1}]`, ...lines]))
    .map((lines) => lines.join("\n"))
    .join("\n\n");

  return normalizeImportedText(text, { title, artist });
}

// --- PDF (yang berisi teks, bukan hasil scan) ---

export async function parsePdf(buffer: Buffer) {
  const { items } = await extractTextItems(new Uint8Array(buffer));
  const output: string[] = [];

  for (const pageItems of items) {
    const words = pageItems.filter((item) => item.str.trim() !== "");
    if (words.length === 0) continue;

    // lebar rata-rata satu huruf, untuk mengubah posisi x jadi kolom teks
    const charWidths = words
      .filter((item) => item.str.length > 0 && item.width > 0)
      .map((item) => item.width / item.str.length)
      .sort((a, b) => a - b);
    const charWidth = charWidths[Math.floor(charWidths.length / 2)] || 5;
    const minX = Math.min(...words.map((item) => item.x));

    // kelompokkan per baris berdasarkan posisi y (dari atas ke bawah)
    const rows: { y: number; height: number; items: typeof words }[] = [];
    for (const item of [...words].sort((a, b) => b.y - a.y || a.x - b.x)) {
      const row = rows.find((candidate) => Math.abs(candidate.y - item.y) < item.fontSize * 0.4);
      if (row) row.items.push(item);
      else rows.push({ y: item.y, height: item.fontSize, items: [item] });
    }

    let previousY: number | undefined;
    for (const row of rows) {
      // jarak antarbaris yang besar dianggap baris kosong (pemisah bagian)
      if (previousY !== undefined && previousY - row.y > row.height * 2.2) output.push("");
      previousY = row.y;

      let line = "";
      for (const item of row.items.sort((a, b) => a.x - b.x)) {
        const column = Math.round((item.x - minX) / charWidth);
        line =
          line.length < column
            ? line.padEnd(column)
            : line.length > 0 && !line.endsWith(" ")
              ? `${line} `
              : line;
        line += item.str;
      }
      output.push(line);
    }
    output.push("");
  }

  return normalizeImportedText(output.join("\n"));
}

// --- Google Docs dan Google Slides (link yang dibagikan publik) ---

const MAX_BYTES = 10 * 1024 * 1024;
const BYTE_ORDER_MARK = new RegExp(`^${String.fromCharCode(0xfeff)}`);

export async function parseGoogleLink(link: string) {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return { error: "Link tidak valid." };
  }
  if (url.hostname !== "docs.google.com") {
    return { error: "Hanya link Google Docs atau Google Slides yang didukung." };
  }

  const docMatch = url.pathname.match(/^\/document\/d\/([\w-]+)/);
  const slideMatch = url.pathname.match(/^\/presentation\/d\/([\w-]+)/);
  if (!docMatch && !slideMatch) {
    return { error: "Link harus dari Google Docs atau Google Slides." };
  }

  // alamat ekspor dibuat sendiri dari ID file, jadi server tidak mengikuti link sembarangan
  const exportUrl = docMatch
    ? `https://docs.google.com/document/d/${docMatch[1]}/export?format=txt`
    : `https://docs.google.com/presentation/d/${slideMatch![1]}/export/pptx`;

  const response = await fetch(exportUrl, { redirect: "follow", cache: "no-store" });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || type.includes("text/html")) {
    return {
      error: 'File tidak bisa dibuka. Pastikan aksesnya diatur ke "Siapa saja yang memiliki link".',
    };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) return { error: "File terlalu besar (maksimal 10 MB)." };

  return docMatch
    ? normalizeImportedText(buffer.toString("utf8").replace(BYTE_ORDER_MARK, ""))
    : parsePptx(buffer);
}
