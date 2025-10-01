import Link from "next/link";

import { auth } from "@/lib/auth";
import { listArticles, listCategories } from "@/server/services/articles";
import { ArticleStatus, Role } from "@prisma/client";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.CONTENT_ADMIN] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

const STATUS_OPTIONS: ReadonlyArray<{ value: "ALL" | ArticleStatus; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: ArticleStatus.DRAFT, label: "Draft" },
  { value: ArticleStatus.REVIEW, label: "Menunggu Review" },
  { value: ArticleStatus.PUBLISHED, label: "Terbit" }
];

interface AdminArticlesPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!hasAccess(role)) {
    return null;
  }

  const query = typeof searchParams?.query === "string" ? searchParams.query : undefined;
  const rawStatus = typeof searchParams?.status === "string" ? searchParams.status.toUpperCase() : "ALL";
  const categorySlug = typeof searchParams?.category === "string" ? searchParams.category : undefined;
  const statusOption = STATUS_OPTIONS.find((option) => option.value === rawStatus) ?? STATUS_OPTIONS[0];

  const [articlesResult, categories] = await Promise.all([
    listArticles({
      query,
      category: categorySlug,
      status: statusOption.value === "ALL" ? undefined : statusOption.value
    }),
    listCategories()
  ]);
  type ArticleItem = (typeof articlesResult.items)[number];
  type CategoryItem = (typeof categories)[number];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Artikel</h1>
          <p className="text-sm text-neutral-500">Kelola konten berita, opini, dan update resmi.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="button-base inline-flex items-center gap-2 bg-primary text-primary-foreground"
        >
          Tulis artikel
        </Link>
      </section>

      <form className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-[2fr,1fr,1fr,auto]">
        <input
          type="search"
          name="query"
          defaultValue={query}
          placeholder="Cari judul atau isi artikel"
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          name="status"
          defaultValue={statusOption.value}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={typeof searchParams?.category === "string" ? searchParams.category : ""}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Semua kategori</option>
          {categories.map((category: CategoryItem) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit" className="button-base bg-neutral-900 text-white">
          Terapkan
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[2fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Artikel</span>
          <span>Status</span>
          <span>Publikasi</span>
        </div>
        {articlesResult.items.length === 0 && (
          <p className="px-5 py-6 text-sm text-neutral-500">Belum ada artikel sesuai filter.</p>
        )}
  {articlesResult.items.map((article: ArticleItem) => (
          <Link
            key={article.id}
            href={`/admin/articles/${article.id}`}
            className="grid grid-cols-[2fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-4 text-sm transition hover:bg-neutral-50"
          >
            <div>
              <p className="font-medium text-neutral-900">{article.title}</p>
              <p className="text-xs text-neutral-500">{article.slug}</p>
              {article.categories.length > 0 && (
                <p className="mt-1 text-xs text-neutral-500">
                  {article.categories
                    .map((item: ArticleItem["categories"][number]) => item.category.name)
                    .join(", ")}
                </p>
              )}
            </div>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  article.status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-700"
                    : article.status === "REVIEW"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {article.status === "PUBLISHED" ? "Terbit" : article.status === "REVIEW" ? "Review" : "Draft"}
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {article.publishedAt
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(article.publishedAt)
                : "Belum dijadwalkan"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
