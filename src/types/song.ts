export type Song = {
  slug: string;
  title: string;
  artist: string;
  key: string;
  bpm?: number;
  timeSignature?: string;
  youtubeUrl?: string;
  // chord di atas lirik, tiap bagian diberi label seperti [Verse], [Chorus], [Bridge]
  content: string;
  createdAt: string;
};

// data ringkas untuk daftar lagu, tanpa isi chord
export type SongSummary = Omit<Song, "content">;
