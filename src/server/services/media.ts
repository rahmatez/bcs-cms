import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const mediaInputSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video"] as const),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().max(160).optional()
});

export async function listMedia({
  query,
  page = 1,
  pageSize = 20
}: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const where: Prisma.MediaWhereInput = {};

  if (query) {
    where.OR = [
      { alt: { contains: query, mode: Prisma.QueryMode.insensitive } },
      { url: { contains: query, mode: Prisma.QueryMode.insensitive } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.media.count({ where })
  ]);

  return { items, total, page, pageSize };
}

export async function createMediaEntry({
  data,
  userId
}: {
  data: z.infer<typeof mediaInputSchema>;
  userId: string;
}) {
  const payload = mediaInputSchema.parse(data);
  return prisma.media.create({
    data: {
      url: payload.url,
      type: payload.type,
      width: payload.width,
      height: payload.height,
      alt: payload.alt,
      createdBy: userId
    }
  });
}

export async function deleteMedia(id: string) {
  return prisma.media.delete({ where: { id } });
}
