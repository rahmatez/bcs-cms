"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { upsertMatch, deleteMatch } from "@/server/services/matches";
import { matchFormSchema, type MatchFormValues } from "./_schema";
import { recordAuditLog } from "@/server/services/audit";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.MATCH_ADMIN] as const;

type SaveMatchPayload = MatchFormValues & { matchId?: string };

function hasAccess(role?: Role | null) {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

function parseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Tanggal tidak valid");
  }
  return date;
}

function parseScore(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function normalizeOptional(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan";
}

export async function saveMatchAction(payload: SaveMatchPayload) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  const { matchId, ...raw } = payload;
  const parsed = matchFormSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return { ok: false, message };
  }

  const data = {
    opponent: parsed.data.opponent,
    eventDate: parseDate(parsed.data.eventDate),
    venue: parsed.data.venue,
    competition: parsed.data.competition,
    status: parsed.data.status,
    scoreHome: parseScore(parsed.data.scoreHome),
    scoreAway: parseScore(parsed.data.scoreAway),
    highlightText: normalizeOptional(parsed.data.highlightText) ?? null,
    highlightUrl: normalizeOptional(parsed.data.highlightUrl) ?? null
  };

  try {
    const match = await upsertMatch(data, matchId);
    await recordAuditLog({
      actorId,
      action: matchId ? "MATCH_UPDATED" : "MATCH_CREATED",
      targetType: "MATCH",
      targetId: match.id,
      meta: {
        opponent: match.opponent,
        status: match.status
      }
    });

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath(`/matches/${match.id}`);
    return { ok: true, matchId: match.id };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deleteMatchAction(matchId: string) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  try {
    await deleteMatch(matchId);
    await recordAuditLog({
      actorId,
      action: "MATCH_DELETED",
      targetType: "MATCH",
      targetId: matchId
    });
    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath(`/matches/${matchId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
