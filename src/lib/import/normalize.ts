import { ALL_KEYS, normalizeKey } from "@/lib/keys";

export type ImportResult = {
  content: string;
  title?: string;
  artist?: string;
  key?: string;
};

const CHORD_TOKEN =
  /^[A-G](?:#|b)?(?:maj|min|m|M|sus|dim|aug|add|\+)?\d*(?:(?:sus|add|maj|b|#)\d+)*(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?$/;
const RHYTHM_TOKEN = /^(?:\|{1,2}|\/|-|x|\.|:\|{1,2}|\|:|\(\d+x\)|n\.?c\.?)$/i;

// baris yang isinya hanya chord (dan tanda birama), misalnya "G   D/F#  Em" atau "| D / / / |"
export function isChordLine(line: string) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return (
    tokens.some((token) => CHORD_TOKEN.test(token)) &&
    tokens.every((token) => CHORD_TOKEN.test(token) || RHYTHM_TOKEN.test(token))
  );
}

const SECTION_LINE =
  /^\s*\[?\s*(intro|verse|bait|pre[\s-]?chorus|pre[\s-]?reff|reff|refrain|chorus|bridge|interlude|instrumen(?:tal)?|musik|outro|ending|coda|tag)\s*(\d+)?\s*\]?\s*[:.]?\s*(.*)$/i;

function formatLabel(name: string, number?: string) {
  const label = name
    .toLowerCase()
    .replace(/^pre[\s-]?/, "pre-")
    .replace(/(^|-)\p{L}/gu, (match) => match.toUpperCase());
  return number ? `${label} ${number}` : label;
}

// "Reff :" -> "[Reff]", "Intro : C G C G" -> "[Intro]" + baris chord
function toSectionLines(line: string) {
  // label berhuruf renggang dari PDF, misalnya "V E R S E 1"
  const spacedOut = /^\s*(?:\S\s){2,}\S\s*$/.test(line) ? line.replace(/\s+/g, "") : null;
  const match = (spacedOut && SECTION_LINE.test(spacedOut) ? spacedOut : line).match(SECTION_LINE);
  if (!match) return null;
  const [, name, number, rest] = match;
  if (rest && !isChordLine(rest)) return null;
  const label = `[${formatLabel(name, number)}]`;
  return rest ? [label, rest.trim()] : [label];
}

export function isSectionLabel(line: string) {
  return /^\s*\[[^\]]+\]\s*$/.test(line) || toSectionLines(line)?.length === 1;
}

// spasi khusus (non-breaking dan sejenisnya) dari Word/PDF diganti spasi biasa
const SPECIAL_SPACES = new RegExp(`[${String.fromCharCode(0xa0, 0x2007, 0x202f)}]`, "g");

const KEY_LINE = /^\s*(?:do|key|kunci|nada dasar|base)\s*[=:]\s*([A-G](?:#|b)?m?)\b/i;

// rapikan hasil impor: spasi, label bagian, key, dan judul di baris pertama
export function normalizeImportedText(text: string, hints: Partial<ImportResult> = {}) {
  let key = hints.key;
  const lines: string[] = [];

  for (const rawLine of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.replace(/\t/g, "    ").replace(SPECIAL_SPACES, " ").replace(/\s+$/, "");

    const keyMatch = line.match(KEY_LINE);
    if (keyMatch && !key) {
      key = keyMatch[1].charAt(0).toUpperCase() + keyMatch[1].slice(1);
      continue;
    }

    lines.push(...(toSectionLines(line) ?? [line]));
  }

  // judul: baris pertama yang bukan chord, bukan label, dan tidak terlalu panjang
  let title = hints.title;
  const firstIndex = lines.findIndex((line) => line.trim() !== "");
  if (!title && firstIndex !== -1) {
    const first = lines[firstIndex].trim();
    if (!isChordLine(first) && !isSectionLabel(first) && first.length <= 80) {
      title = first;
      lines.splice(firstIndex, 1);
    }
  }

  const content = lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*\n|\n\s*$/g, "");

  return {
    content,
    title,
    artist: hints.artist,
    key: key && ALL_KEYS.includes(normalizeKey(key, key)) ? normalizeKey(key, key) : undefined,
  } satisfies ImportResult;
}
