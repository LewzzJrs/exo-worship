export type SetlistItem = {
  slug: string;
  // key yang dipakai di setlist ini, bisa beda dengan key asli lagu
  key: string;
  // catatan singkat untuk tim, misalnya "intro 2x"
  note?: string;
  // aransemen khusus untuk setlist ini (setlist tim); kosong berarti pakai versi library
  arrangement?: string;
  // key yang dipakai saat aransemen ditulis
  arrangementKey?: string;
};

export type Setlist = {
  id: string;
  name: string;
  // format YYYY-MM-DD
  date: string;
  items: SetlistItem[];
  createdAt: string;
  // nama admin yang membuat dan terakhir mengubah (khusus setlist tim)
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
};
