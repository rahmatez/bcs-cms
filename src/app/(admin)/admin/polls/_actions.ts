"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { PollStatus, Role } from "@prisma/client";
import { upsertPoll, deletePoll, updatePollStatus } from "@/server/services/interaction";
import { pollFormSchema, type PollFormValues } from "./_schema";
import { recordAuditLog } from "@/server/services/audit";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.MODERATOR] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

type SavePollPayload = PollFormValues & { pollId?: string };

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

function parseSchedule(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan";
}

export async function savePollAction(payload: SavePollPayload) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  const { pollId, ...raw } = payload;
  const parsed = pollFormSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return { ok: false, message };
  }

  const startsAt = parseSchedule(parsed.data.startsAt);
  if (startsAt === null) {
    return { ok: false, message: "Waktu mulai tidak valid" };
  }

  const endsAt = parseSchedule(parsed.data.endsAt);
  if (endsAt === null) {
    return { ok: false, message: "Waktu selesai tidak valid" };
  }

  const data = {
    question: parsed.data.question,
    options: parsed.data.options,
    startsAt,
    endsAt
  } satisfies Parameters<typeof upsertPoll>[0]["input"];

  try {
    const poll = await upsertPoll({ pollId, input: data });
    await recordAuditLog({
      actorId,
      action: pollId ? "POLL_UPDATED" : "POLL_CREATED",
      targetType: "POLL",
      targetId: poll.id,
      meta: {
        question: poll.question
      }
    });

    revalidatePath("/admin/polls");
    revalidatePath("/");
    return { ok: true, pollId: poll.id };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deletePollAction(pollId: string) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  try {
    await deletePoll(pollId);
    await recordAuditLog({
      actorId,
      action: "POLL_DELETED",
      targetType: "POLL",
      targetId: pollId
    });
    revalidatePath("/admin/polls");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function updatePollStatusAction(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  const pollId = formData.get("pollId");
  const status = formData.get("status");

  if (typeof pollId !== "string" || typeof status !== "string") {
    return { ok: false, message: "Data tidak valid" };
  }

  const nextStatus = Object.values(PollStatus).find((value) => value === status);

  if (!nextStatus) {
    return { ok: false, message: "Status tidak dikenal" };
  }

  try {
    const poll = await updatePollStatus({ pollId, status: nextStatus });
    await recordAuditLog({
      actorId,
      action: "POLL_STATUS_UPDATED",
      targetType: "POLL",
      targetId: pollId,
      meta: { status: nextStatus }
    });
    revalidatePath("/admin/polls");
    revalidatePath("/");
    return { ok: true, status: poll.status };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
