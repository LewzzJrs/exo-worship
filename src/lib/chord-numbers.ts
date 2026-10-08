// chord angka (sistem "Do = ..."/Nashville): chord ditulis sebagai nomor nada di dalam key,
// misalnya di key G: G = 1, C = 4, D/F# = 5/7, Em = 6m

const NOTE_VALUES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// nada di luar tangga nada ditulis dengan b, kecuali chord aslinya memakai #
const FLAT_DEGREES = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];
const SHARP_DEGREES = ["1", "#1", "2", "#2", "3", "4", "#4", "5", "#5", "6", "#6", "7"];
const DO_NAMES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const KEY_PATTERN = /^([A-G])([#b]?)(m?)$/;
const CHORD_PATTERN = /^([A-G])([#b]?)([^/]*)(?:\/([A-G])([#b]?))?$/;

function noteValue(letter: string, accidental: string) {
  const offset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (NOTE_VALUES[letter] + offset + 12) % 12;
}

// nada Do; key minor memakai relatif mayornya (Bm: Do = D, jadi Bm = 6m)
function doValue(key: string) {
  const match = key.trim().match(KEY_PATTERN);
  if (!match) return null;
  const [, letter, accidental, minor] = match;
  return (noteValue(letter, accidental) + (minor ? 3 : 0)) % 12;
}

function toDegree(letter: string, accidental: string, doNote: number) {
  const interval = (noteValue(letter, accidental) - doNote + 12) % 12;
  // nada di tengah (tritone) lebih umum ditulis #4, kecuali chordnya memang ditulis dengan b (Gb di key C)
  if (interval === 6 && accidental !== "b") return "#4";
  return (accidental === "#" ? SHARP_DEGREES : FLAT_DEGREES)[interval];
}

// nama nada Do untuk keterangan di atas lagu, misalnya "G" untuk key G atau Em
export function doNoteName(key: string) {
  const value = doValue(key);
  return value === null ? null : DO_NAMES[value];
}

export type NumberChord = {
  degree: string;
  // sisa nama chord apa adanya: m, 7, sus4, maj7, add9, ...
  suffix: string;
  bass: string | null;
};

// null kalau bukan chord (garis birama, "/", N.C.) atau key tidak terbaca
export function toNumberChord(chord: string, key: string): NumberChord | null {
  const doNote = doValue(key);
  const match = chord.trim().match(CHORD_PATTERN);
  if (doNote === null || !match) return null;

  const [, letter, accidental, suffix, bassLetter, bassAccidental = ""] = match;
  return {
    degree: toDegree(letter, accidental, doNote),
    suffix,
    bass: bassLetter ? toDegree(bassLetter, bassAccidental, doNote) : null,
  };
}
