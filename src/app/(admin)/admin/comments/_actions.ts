"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Role, CommentStatus } from "@prisma/client";
import { moderateComment } from "@/server/services/interaction";
import { recordAuditLog } from "@/server/services/audit";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.MODERATOR, Role.CONTENT_ADMIN] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

function isCommentStatus(value: string): value is CommentStatus {
  return ["PENDING", "APPROVED", "REJECTED"].includes(value);
}

export async function moderateCommentAction(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Tidak diizinkan" };
  }

  const commentId = formData.get("commentId");
  const statusValue = formData.get("status");
  const refType = formData.get("refType");
  const refId = formData.get("refId");

  if (typeof commentId !== "string" || typeof statusValue !== "string") {
    return { ok: false, message: "Data tidak valid" };
  }

  if (!isCommentStatus(statusValue)) {
    return { ok: false, message: "Status tidak dikenal" };
  }

  try {
    const updated = await moderateComment({ commentId, status: statusValue });

    const meta: Record<string, string> = { status: statusValue };
    if (typeof refType === "string") {
      meta.refType = refType;
    }
    if (typeof refId === "string") {
      meta.refId = refId;
    }

    await recordAuditLog({
      actorId,
      action: "COMMENT_MODERATED",
      targetType: "COMMENT",
      targetId: commentId,
      meta
    });

    revalidatePath("/admin/comments");
    if (refType === "ARTICLE") {
      revalidatePath("/news");
    }
    if (refType === "PRODUCT") {
      revalidatePath("/store");
    }

    return { ok: true, status: updated.status };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan" };
  }
}
