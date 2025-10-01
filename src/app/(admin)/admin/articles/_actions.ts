"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { deleteArticle, upsertArticle } from "@/server/services/articles";
import { recordAuditLog } from "@/server/services/audit";
import { articleFormSchema, type ArticleFormValues } from "./_schema";

const ALLOWED_ROLES = ["SUPER_ADMIN", "CONTENT_ADMIN"] as const;

type SaveArticlePayload = ArticleFormValues & { articleId?: string };

function ensureAccess(role?: string | null): role is typeof ALLOWED_ROLES[number] {
  return !!role && ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number]);
}

function parsePublishedAt(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan";
}

export async function saveArticleAction(payload: SaveArticlePayload) {
  const session = await auth();
  const role = session?.user?.role ?? null;
  const userId = session?.user?.id;

  if (!ensureAccess(role) || !userId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  const { articleId, ...raw } = payload;
  const parsed = articleFormSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return { ok: false, message };
  }

  const data = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    excerpt: parsed.data.excerpt?.trim() || undefined,
    body: parsed.data.body,
    coverUrl: parsed.data.coverUrl ? parsed.data.coverUrl : undefined,
    categories: parsed.data.categoryIds ?? [],
    status: parsed.data.status,
    publishedAt: parsePublishedAt(parsed.data.publishedAt)
  };

  try {
    const article = await upsertArticle({ data, authorId: userId, articleId });
    await recordAuditLog({
      actorId: userId,
      action: articleId ? "ARTICLE_UPDATED" : "ARTICLE_CREATED",
      targetType: "ARTICLE",
      targetId: article.id,
      meta: {
        status: article.status,
        slug: article.slug
      }
    });
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${article.id}`);
    revalidatePath("/news");
    revalidatePath(`/news/${article.slug}`);
    revalidatePath("/");
    return { ok: true, articleId: article.id, slug: article.slug };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deleteArticleAction(articleId: string) {
  const session = await auth();
  const role = session?.user?.role ?? null;
  const actorId = session?.user?.id ?? null;

  if (!ensureAccess(role) || !actorId) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  try {
    await deleteArticle(articleId);
    await recordAuditLog({
      actorId,
      action: "ARTICLE_DELETED",
      targetType: "ARTICLE",
      targetId: articleId
    });
    revalidatePath("/admin/articles");
    revalidatePath("/news");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
