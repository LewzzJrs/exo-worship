import { z } from "zod";
import { getYoutubeId } from "@/lib/youtube";

export const requestSchema = z.object({
  requesterName: z.string().trim().min(1, "Nama wajib diisi").max(60, "Nama maksimal 60 karakter"),
  title: z.string().trim().min(1, "Judul lagu wajib diisi").max(120, "Judul maksimal 120 karakter"),
  artist: z.string().trim().max(120, "Nama artis maksimal 120 karakter"),
  youtubeUrl: z
    .string()
    .trim()
    .max(300, "Link terlalu panjang")
    .refine((url) => url === "" || getYoutubeId(url) !== null, "Link YouTube tidak valid"),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter"),
});

export type RequestValues = z.infer<typeof requestSchema>;
