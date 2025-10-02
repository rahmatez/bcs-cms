import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Suspense } from "react";
import { PageHeroSlider } from "@/components/page-hero-slider";

async function ArticlesList({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const page = Number(searchParams.page ?? "1");
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const query = typeof searchParams.query === "string" ? searchParams.query : undefined;

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(category
        ? {
            categories: {
              some: {
                category: { slug: category }
              }
            }
          }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { body: { contains: query, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: {
      categories: {
        include: { category: true }
      }
    },
    orderBy: { publishedAt: "desc" },
    take: 12,
    skip: (page - 1) * 12
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeroSlider
        title="News & Articles"
        subtitle="Info kegiatan, opini, dan liputan eksklusif dari Brigata Curva Sud"
        height="medium"
      />
      
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <form className="flex w-full gap-2 sm:w-auto">
            <input
              type="search"
              name="query"
              defaultValue={query}
              placeholder="Cari artikel"
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-64"
            />
            <button type="submit" className="button-base bg-primary text-white hover:bg-primary-600">
              Cari
            </button>
          </form>
        </div>

      <div className="mt-8 flex flex-wrap gap-2 text-xs">
        <Link
          href="/news"
          className={`rounded-full border px-3 py-1 transition ${!category ? "border-primary bg-primary text-white" : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600"}`}
        >
          Semua
        </Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/news?category=${item.slug}`}
            className={`rounded-full border px-3 py-1 transition ${category === item.slug ? "border-primary bg-primary text-white" : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600"}`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article key={article.id} className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 shadow-sm hover:border-neutral-600 transition-colors">
            <p className="text-xs uppercase text-neutral-400">
              {article.publishedAt ? format(article.publishedAt, "dd MMM yyyy") : "Draft"}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              <Link href={`/news/${article.slug}`} className="hover:text-secondary-600">
                {article.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm text-neutral-400 line-clamp-3">
              {article.excerpt ?? article.body.slice(0, 160)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-400">
              {article.categories.map((categoryItem) => (
                <span key={categoryItem.categoryId} className="rounded-full bg-neutral-700 px-3 py-1 text-neutral-300">
                  #{categoryItem.category.name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      </div>
    </>
  );
}

export default function NewsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12">Memuat berita...</div>}>
      <ArticlesList searchParams={searchParams} />
    </Suspense>
  );
}
