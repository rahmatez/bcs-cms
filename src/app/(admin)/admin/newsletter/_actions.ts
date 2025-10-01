"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { updateVolunteerStatus } from "@/server/services/interaction";
import { recordAuditLog } from "@/server/services/audit";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.MODERATOR, Role.CONTENT_ADMIN] as const;

function hasAccess(role?: Role | null) {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

export async function updateVolunteerStatusAction(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Tidak diizinkan" };
  }

  const volunteerId = formData.get("volunteerId");
  const status = formData.get("status");

  if (typeof volunteerId !== "string" || typeof status !== "string") {
    return { ok: false, message: "Data tidak valid" };
  }

  try {
    const volunteer = await updateVolunteerStatus({ volunteerId, status });
    await recordAuditLog({
      actorId,
      action: "VOLUNTEER_STATUS_UPDATED",
      targetType: "VOLUNTEER",
      targetId: volunteerId,
      meta: { status }
    });
    revalidatePath("/admin/newsletter");
    return { ok: true, status: volunteer.status };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan" };
  }
}
