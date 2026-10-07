import { z } from "zod";
import { ALL_KEYS } from "@/lib/keys";
import { getYoutubeId } from "@/lib/youtube";

export const songSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(120, "Judul maksimal 120 karakter"),
  artist: z.string().trim().max(120, "Nama artis maksimal 120 karakter"),
  key: z.string().refine((key) => ALL_KEYS.includes(key), "Pilih key asli lagu"),
  // dari input teks, boleh kosong
  bpm: z
    .string()
    .trim()
    .refine((bpm) => bpm === "" || (/^\d+$/.test(bpm) && +bpm >= 20 && +bpm <= 300), {
      message: "BPM harus angka 20–300",
    }),
  timeSignature: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{1,2}\/\d{1,2}$/.test(value), "Contoh birama: 4/4"),
  youtubeUrl: z
    .string()
    .trim()
    .max(300, "Link terlalu panjang")
    .refine((url) => url === "" || getYoutubeId(url) !== null, "Link YouTube tidak valid"),
  content: z
    .string()
    .max(30000, "Isi lagu terlalu panjang")
    .refine((content) => content.trim() !== "", "Isi chord dan lirik wajib diisi"),
});

export type SongValues = z.infer<typeof songSchema>;
