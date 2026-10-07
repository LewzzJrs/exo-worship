import { z } from "zod";

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password wajib diisi"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export const teamCodeSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(6, "Kode minimal 6 karakter")
      .max(40, "Kode maksimal 40 karakter")
      .regex(/^[A-Za-z0-9-]+$/, "Pakai huruf, angka, dan tanda - saja"),
    confirm: z.string().trim(),
  })
  .refine((values) => values.code.toUpperCase() === values.confirm.toUpperCase(), {
    message: "Kode tidak sama",
    path: ["confirm"],
  });

export type TeamCodeValues = z.infer<typeof teamCodeSchema>;
