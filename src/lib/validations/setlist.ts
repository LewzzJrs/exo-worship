import { z } from "zod";

export const setlistSchema = z.object({
  name: z.string().trim().min(1, "Nama setlist wajib diisi").max(60, "Nama maksimal 60 karakter"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal wajib diisi"),
});

export type SetlistValues = z.infer<typeof setlistSchema>;
