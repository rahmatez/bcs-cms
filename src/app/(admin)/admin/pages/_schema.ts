import { z } from "zod";

export const pageFormSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  body: z.string().min(10, "Konten minimal 10 karakter"),
  status: z.enum(["DRAFT", "PUBLISHED"] as const),
  publishedAt: z.string().optional()
});

export type PageFormValues = z.infer<typeof pageFormSchema>;
