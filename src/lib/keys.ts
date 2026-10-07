import { Key } from "chordsheetjs";

// penulisan key yang umum dipakai tim, supaya transpose tidak menghasilkan A# atau D#
const MAJOR_KEYS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const MINOR_KEYS = ["Cm", "C#m", "Dm", "Ebm", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "Bbm", "Bm"];

// pilihan key asli saat admin membuat lagu
export const ALL_KEYS = [...MAJOR_KEYS, ...MINOR_KEYS];

export function getKeyOptions(originalKey: string) {
  return /^[A-G][#b]?m$/.test(originalKey) ? MINOR_KEYS : MAJOR_KEYS;
}

function findKeyIndex(key: string, options: string[]) {
  if (!Key.parse(key)) return -1;
  return options.findIndex((option) => Key.distance(option, key) === 0);
}

// key dari URL bisa ditulis apa saja (misal A#), samakan ke daftar pilihan
export function normalizeKey(key: string | undefined, originalKey: string) {
  if (!key) return originalKey;
  const options = getKeyOptions(originalKey);
  const index = findKeyIndex(key, options);
  return index === -1 ? originalKey : options[index];
}

export function shiftKey(currentKey: string, step: number, originalKey: string) {
  const options = getKeyOptions(originalKey);
  const index = findKeyIndex(currentKey, options);
  if (index === -1) return currentKey;
  return options[(index + step + options.length) % options.length];
}

export function isSameKey(a: string, b: string) {
  return Key.parse(a) !== null && Key.parse(b) !== null && Key.distance(a, b) === 0;
}
