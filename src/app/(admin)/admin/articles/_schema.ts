import { z } from "zod";

export const articleFormSchema = z.object({
  title: z.string().min(4, "Judul minimal 4 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  excerpt: z.string().max(280, "Maksimal 280 karakter").optional().or(z.literal("")),
  body: z.string().min(20, "Konten artikel minimal 20 karakter"),
  coverUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED"] as const),
  publishedAt: z.string().optional().or(z.literal("")),
  categoryIds: z.array(z.string()).optional().default([])
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
