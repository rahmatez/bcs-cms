import { z } from "zod";

export const matchFormSchema = z.object({
  opponent: z.string().min(2, "Nama lawan minimal 2 karakter"),
  eventDate: z.string().min(1, "Tanggal wajib diisi"),
  venue: z.string().min(2, "Venue minimal 2 karakter"),
  competition: z.string().min(2, "Kompetisi minimal 2 karakter"),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "POSTPONED"] as const),
  scoreHome: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+$/.test(value), "Skor harus berupa angka"),
  scoreAway: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+$/.test(value), "Skor harus berupa angka"),
  highlightText: z.string().max(240, "Maksimal 240 karakter").optional(),
  highlightUrl: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), "Gunakan URL yang valid")
});

export type MatchFormValues = z.infer<typeof matchFormSchema>;
