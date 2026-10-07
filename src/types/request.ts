export type RequestStatus = "menunggu" | "diproses" | "selesai" | "ditolak";

export type SongRequest = {
  id: string;
  requesterName: string;
  title: string;
  artist: string | null;
  youtubeUrl: string | null;
  note: string | null;
  status: RequestStatus;
  // terisi kalau admin sudah membuat lagunya
  songSlug: string | null;
  createdAt: string;
};
