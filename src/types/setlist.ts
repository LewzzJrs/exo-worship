export type SetlistItem = {
  slug: string;
  // key yang dipakai di setlist ini, bisa beda dengan key asli lagu
  key: string;
  // catatan singkat untuk tim, misalnya "intro 2x"
  note?: string;
};

export type Setlist = {
  id: string;
  name: string;
  // format YYYY-MM-DD
  date: string;
  items: SetlistItem[];
  createdAt: string;
};
