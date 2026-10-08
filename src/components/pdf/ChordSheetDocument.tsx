import { Fragment } from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { chordSheetFonts } from "@/components/pdf/fonts";
import { doNoteName, numberChordParts } from "@/lib/chord-numbers";
import { lineToRows, parseSections } from "@/lib/chord-sheet";
import { APP_NAME } from "@/lib/constants";
import { DEFAULT_PDF_OPTIONS, type PdfOptions } from "@/lib/pdf-options";
import { formatSetlistDate } from "@/lib/setlist-utils";
import type { Song } from "@/types/song";

// dirender di server (route /api/pdf), bukan komponen untuk halaman web

export type PdfSong = {
  song: Song;
  key: string;
  // catatan dari setlist, misalnya "intro 2x"
  note?: string;
  // memakai aransemen khusus setlist, bukan versi library
  arranged?: boolean;
};

type ChordSheetDocumentProps = {
  songs: PdfSong[];
  name?: string;
  date?: string;
  // jenis font dan ukuran huruf chord + lirik
  options?: PdfOptions;
};

const PAGE_PADDING = 40;
const CONTENT_WIDTH = 595 - PAGE_PADDING * 2; // lebar A4 dalam point
// semua pilihan font monospace lebarnya 0,6 x ukuran font per huruf
const MONO_CHAR_WIDTH = 0.6;
const NBSP = String.fromCharCode(160);
// angka kecil di atas pada chord angka (5⁷), dibanding ukuran chord biasa
const RAISED_SCALE = 0.7;

const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_PADDING,
    paddingBottom: 56,
    paddingHorizontal: PAGE_PADDING,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
  },
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  title: { fontFamily: "Helvetica-Bold", fontSize: 18 },
  subtitle: { marginTop: 3, fontSize: 11, color: "#555555" },
  meta: { marginTop: 6, fontSize: 9, color: "#555555" },
  section: { marginBottom: 12 },
  label: {
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1,
    color: "#666666",
  },
  lyrics: { marginBottom: 3 },
  // not angka melodi di antara chord dan lirik
  melody: { color: "#444444" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#888888",
  },
  coverRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  coverNumber: { width: 24, color: "#888888" },
  coverSong: { flex: 1 },
  coverArtist: { marginTop: 2, fontSize: 9, color: "#666666" },
  coverNote: { marginTop: 2, fontSize: 9, fontFamily: "Helvetica-Oblique" },
  note: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    backgroundColor: "#f1f1ef",
  },
  coverKey: { width: 60, textAlign: "right", fontFamily: "Helvetica-Bold" },
});

// spasi diganti spasi tetap supaya posisi chord tidak bergeser
function keepSpaces(text: string) {
  return text.replaceAll(" ", NBSP);
}

// baris yang terlalu panjang diperkecil hurufnya supaya tetap muat satu baris
function fitFontSize(length: number, baseSize: number) {
  const maxSize = CONTENT_WIDTH / (length * MONO_CHAR_WIDTH);
  return Math.min(baseSize, Math.max(6, maxSize));
}

function Footer({ label }: { label: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{label}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
    </View>
  );
}

type SongPageProps = {
  song: Song;
  songKey: string;
  note?: string;
  arranged?: boolean;
  footer: string;
  options: PdfOptions;
};

function SongPage({ song, songKey, note, arranged, footer, options }: SongPageProps) {
  const sections = parseSections(song.content, song.key, songKey);
  const fonts = chordSheetFonts(options.font);
  const numberChords = options.chords === "angka";
  const formatChord = numberChords
    ? (chord: string) => numberChordParts(chord, songKey)
    : undefined;
  const hasMelody = sections.some((section) => section.lines.some((line) => line.hasMelody));
  // nada Do dibutuhkan untuk chord angka dan untuk membaca not angka melodi
  const doNote = numberChords || hasMelody ? doNoteName(songKey) : null;
  const meta = [
    // aransemen khusus tidak menyebut key asli library
    songKey === song.key || arranged ? `Key ${songKey}` : `Key ${songKey} (asli ${song.key})`,
    doNote && `Do = ${doNote}`,
    arranged && "Aransemen khusus setlist",
    song.bpm && `${song.bpm} BPM`,
    song.timeSignature,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.subtitle}>{song.artist}</Text>
        <Text style={styles.meta}>{meta.join("  ·  ")}</Text>
        {note && <Text style={styles.note}>Catatan: {note}</Text>}
      </View>

      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.label && <Text style={styles.label}>{section.label.toUpperCase()}</Text>}
          {section.lines.map((line, lineIndex) => {
            const rows = lineToRows(line, formatChord);
            if (!rows.chords && rows.melody.length === 0 && !rows.lyrics) return null;
            const fontSize = fitFontSize(
              Math.max(
                rows.chords?.length ?? 0,
                ...rows.melody.map((row) => row.length),
                rows.lyrics?.length ?? 0,
              ),
              options.size,
            );

            // baris chord dan liriknya tidak boleh terpisah halaman
            return (
              <View key={lineIndex} wrap={false} style={{ fontSize }}>
                {rows.chords && (
                  <Text style={fonts.chords}>
                    {rows.chordParts.map((part, partIndex) =>
                      part.raised ? (
                        // lebih kecil dan naik, tapi tetap selebar satu kolom huruf supaya chord berikutnya tidak bergeser
                        <Text
                          key={partIndex}
                          style={{
                            fontSize: fontSize * RAISED_SCALE,
                            verticalAlign: "super",
                            letterSpacing: fontSize * MONO_CHAR_WIDTH * (1 - RAISED_SCALE),
                          }}
                        >
                          {part.text}
                        </Text>
                      ) : (
                        <Fragment key={partIndex}>{keepSpaces(part.text)}</Fragment>
                      ),
                    )}
                  </Text>
                )}
                {rows.melody.map((row, melodyIndex) => (
                  <Text key={melodyIndex} style={[styles.melody, fonts.lyrics]}>
                    {keepSpaces(row)}
                  </Text>
                ))}
                {rows.lyrics && (
                  <Text style={[styles.lyrics, fonts.lyrics]}>{keepSpaces(rows.lyrics)}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}

      <Footer label={footer} />
    </Page>
  );
}

export function ChordSheetDocument({
  songs,
  name,
  date,
  options = DEFAULT_PDF_OPTIONS,
}: ChordSheetDocumentProps) {
  const isSetlist = Boolean(name);
  const footer = isSetlist ? `${name} · ${APP_NAME}` : APP_NAME;

  return (
    <Document title={name ?? songs[0]?.song.title} author={APP_NAME} creator={APP_NAME}>
      {isSetlist && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            {date && <Text style={styles.subtitle}>{formatSetlistDate(date)}</Text>}
            <Text style={styles.meta}>{songs.length} lagu</Text>
          </View>
          {songs.map(({ song, key, note }, index) => (
            <View key={index} style={styles.coverRow}>
              <Text style={styles.coverNumber}>{index + 1}.</Text>
              <View style={styles.coverSong}>
                <Text>{song.title}</Text>
                <Text style={styles.coverArtist}>{song.artist}</Text>
                {note && <Text style={styles.coverNote}>{note}</Text>}
              </View>
              <Text style={styles.coverKey}>Key {key}</Text>
            </View>
          ))}
          <Footer label={footer} />
        </Page>
      )}

      {songs.map(({ song, key, note, arranged }, index) => (
        <SongPage
          key={index}
          song={song}
          songKey={key}
          note={note}
          arranged={arranged}
          footer={footer}
          options={options}
        />
      ))}
    </Document>
  );
}
