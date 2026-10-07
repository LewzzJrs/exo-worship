import { z } from "zod";

export const accessSchema = z.object({
  code: z.string().trim().min(1, "Kode akses wajib diisi"),
});

export type AccessValues = z.infer<typeof accessSchema>;
