import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { lineToRows, parseSections } from "@/lib/chord-sheet";
import { APP_NAME } from "@/lib/constants";
import { formatSetlistDate } from "@/lib/setlist-utils";
import type { Song } from "@/types/song";

// dirender di server (route /api/pdf), bukan komponen untuk halaman web

export type PdfSong = {
  song: Song;
  key: string;
  // catatan dari setlist, misalnya "intro 2x"
  note?: string;
};

type ChordSheetDocumentProps = {
  songs: PdfSong[];
  name?: string;
  date?: string;
};

const PAGE_PADDING = 40;
const CONTENT_WIDTH = 595 - PAGE_PADDING * 2; // lebar A4 dalam point
const COURIER_CHAR_WIDTH = 0.6; // lebar satu huruf Courier = 0,6 x ukuran font
const BASE_FONT_SIZE = 10;
const NBSP = String.fromCharCode(160);

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
  chords: { fontFamily: "Courier-Bold" },
  lyrics: { fontFamily: "Courier", marginBottom: 3 },
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
function fitFontSize(length: number) {
  const maxSize = CONTENT_WIDTH / (length * COURIER_CHAR_WIDTH);
  return Math.min(BASE_FONT_SIZE, Math.max(6, maxSize));
}

function Footer({ label }: { label: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{label}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
    </View>
  );
}

type SongPageProps = { song: Song; songKey: string; note?: string; footer: string };

function SongPage({ song, songKey, note, footer }: SongPageProps) {
  const sections = parseSections(song.content, song.key, songKey);
  const meta = [
    songKey === song.key ? `Key ${songKey}` : `Key ${songKey} (asli ${song.key})`,
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
          {section.song.lines.map((line, lineIndex) => {
            const rows = lineToRows(line);
            if (!rows.chords && !rows.lyrics) return null;
            const fontSize = fitFontSize(
              Math.max(rows.chords?.length ?? 0, rows.lyrics?.length ?? 0),
            );

            // baris chord dan liriknya tidak boleh terpisah halaman
            return (
              <View key={lineIndex} wrap={false} style={{ fontSize }}>
                {rows.chords && <Text style={styles.chords}>{keepSpaces(rows.chords)}</Text>}
                {rows.lyrics && <Text style={styles.lyrics}>{keepSpaces(rows.lyrics)}</Text>}
              </View>
            );
          })}
        </View>
      ))}

      <Footer label={footer} />
    </Page>
  );
}

export function ChordSheetDocument({ songs, name, date }: ChordSheetDocumentProps) {
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

      {songs.map(({ song, key, note }, index) => (
        <SongPage key={index} song={song} songKey={key} note={note} footer={footer} />
      ))}
    </Document>
  );
}
