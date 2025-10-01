import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const pageInputSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  body: z.string().min(10),
  status: z.enum(["DRAFT", "PUBLISHED"] as const),
  publishedAt: z.coerce.date().optional()
});

export async function listPagesAdmin() {
  return prisma.page.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id } });
}

export async function upsertPage(data: z.infer<typeof pageInputSchema>, pageId?: string) {
  const payload = pageInputSchema.parse(data);

  if (pageId) {
    return prisma.page.update({
      where: { id: pageId },
      data: payload
    });
  }

  return prisma.page.create({ data: payload });
}

export async function deletePage(pageId: string) {
  return prisma.page.delete({ where: { id: pageId } });
}
