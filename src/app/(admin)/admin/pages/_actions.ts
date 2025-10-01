"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { pageFormSchema, type PageFormValues } from "./_schema";
import { deletePage, upsertPage } from "@/server/services/pages";
import { recordAuditLog } from "@/server/services/audit";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.CONTENT_ADMIN] as const;

type SavePagePayload = PageFormValues & { pageId?: string };

type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

function parsePublishedAt(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan";
}

export async function savePageAction(payload: SavePagePayload) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  const { pageId, ...raw } = payload;
  const parsed = pageFormSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return { ok: false, message };
  }

  const data = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    body: parsed.data.body,
    status: parsed.data.status,
    publishedAt: parsePublishedAt(parsed.data.publishedAt)
  };

  try {
    const page = await upsertPage(data, pageId);
    await recordAuditLog({
      actorId,
      action: pageId ? "PAGE_UPDATED" : "PAGE_CREATED",
      targetType: "PAGE",
      targetId: page.id,
      meta: {
        slug: page.slug,
        status: page.status
      }
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/pages/${page.slug}`);
    return { ok: true, pageId: page.id, slug: page.slug };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deletePageAction(pageId: string, slug: string) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  try {
    await deletePage(pageId);
    await recordAuditLog({
      actorId,
      action: "PAGE_DELETED",
      targetType: "PAGE",
      targetId: pageId,
      meta: { slug }
    });
    revalidatePath("/admin/pages");
    revalidatePath(`/pages/${slug}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
