import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getArticleById, listCategories } from "@/server/services/articles";
import { ArticleForm } from "../_components/article-form";
import type { ArticleFormValues } from "../_schema";
import { Role } from "@prisma/client";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.CONTENT_ADMIN] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

function toInputDateTime(date?: Date | null) {
  if (!date) return "";
  const iso = date.toISOString();
  return iso.slice(0, 16);
}

interface AdminArticleDetailPageProps {
  params: { id: string };
}

export default async function AdminArticleDetailPage({ params }: AdminArticleDetailPageProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!hasAccess(role)) {
    redirect("/admin");
  }

  const [article, categories] = await Promise.all([
    getArticleById(params.id),
    listCategories()
  ]);

  if (!article) {
    notFound();
  }

  type ArticleWithCategories = NonNullable<typeof article>;
  type CategoryRelation = ArticleWithCategories["categories"][number];

  const initialValues: ArticleFormValues = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    body: article.body,
    coverUrl: article.coverUrl ?? "",
    status: article.status,
    publishedAt: toInputDateTime(article.publishedAt),
    categoryIds: article.categories.map((item: CategoryRelation) => item.categoryId)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Edit Artikel</h1>
        <p className="text-sm text-neutral-500">Perbarui konten dan status publikasi artikel ini.</p>
      </div>
      <ArticleForm articleId={article.id} categories={categories} initialValues={initialValues} />
    </div>
  );
}
