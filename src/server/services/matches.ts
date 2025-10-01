import { prisma } from "@/lib/prisma";
import { MatchStatus, Prisma } from "@prisma/client";
import { z } from "zod";

export const matchInputSchema = z.object({
  opponent: z.string().min(2),
  eventDate: z.coerce.date(),
  venue: z.string().min(2),
  competition: z.string().min(2),
  status: z.nativeEnum(MatchStatus).default(MatchStatus.SCHEDULED),
  scoreHome: z.number().int().optional().nullable(),
  scoreAway: z.number().int().optional().nullable(),
  highlightText: z.string().max(240).optional().nullable(),
  highlightUrl: z.string().url().optional().nullable()
});

export async function listUpcomingMatches(limit = 5) {
  return prisma.match.findMany({
    where: { status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] } },
    orderBy: { eventDate: "asc" },
    take: limit
  });
}

export async function listPastMatches({ page = 1, pageSize = 10 }) {
  const where = { status: MatchStatus.FINISHED };
  const [items, total] = await Promise.all([
    prisma.match.findMany({
      where,
      orderBy: { eventDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.match.count({ where })
  ]);
  return { items, total, page, pageSize };
}

export async function upsertMatch(data: z.infer<typeof matchInputSchema>, matchId?: string) {
  const payload = matchInputSchema.parse(data);

  if (matchId) {
    return prisma.match.update({
      where: { id: matchId },
      data: payload
    });
  }

  return prisma.match.create({ data: payload });
}

export async function getMatch(id: string) {
  return prisma.match.findUnique({ where: { id } });
}

export async function listMatchesAdmin({
  status,
  competition
}: {
  status?: MatchStatus | "ALL";
  competition?: string;
}) {
  const where: Prisma.MatchWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (competition) {
    where.competition = { contains: competition, mode: Prisma.QueryMode.insensitive };
  }

  return prisma.match.findMany({
    where,
    orderBy: { eventDate: "desc" }
  });
}

export async function deleteMatch(id: string) {
  return prisma.match.delete({ where: { id } });
}
