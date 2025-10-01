import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { format } from "date-fns";

const window = new JSDOM("" + "").window;
const purify = DOMPurify(window);

type ArticleWithRelations = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  status: string;
  author: { name: string | null } | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  categories: Array<{
    categoryId: string;
    category: { id: string; name: string; slug: string };
  }>;
};

type CommentWithUser = {
  id: string;
  body: string;
  createdAt: Date;
  user: { name: string | null } | null;
};

export default async function ArticleDetail({ params }: { params: { slug: string } }) {
  const article = (await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: true } }
    }
  })) as ArticleWithRelations | null;

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const comments = (await prisma.comment.findMany({
    where: {
      refType: "ARTICLE",
      refId: article.id,
      status: "APPROVED"
    },
    include: {
      user: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  })) as CommentWithUser[];

  const sanitized = purify.sanitize(article.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/news" className="text-sm text-primary">← Kembali</Link>
      <header className="mt-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Artikel</p>
        <h1 className="text-4xl font-display font-semibold">{article.title}</h1>
        <div className="text-xs uppercase text-neutral-500">
          {article.publishedAt ? format(article.publishedAt, "dd MMM yyyy") : "Draft"} ·
          <span className="ml-2">{article.author?.name ?? "BCS"}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          {article.categories.map((categoryItem) => (
            <span key={categoryItem.categoryId} className="rounded-full bg-neutral-100 px-3 py-1">
              #{categoryItem.category.name}
            </span>
          ))}
        </div>
      </header>

      <div className="prose prose-neutral mt-10 max-w-none">
        <ReactMarkdown>{sanitized}</ReactMarkdown>
      </div>

      <section className="mt-16 border-t border-neutral-200 pt-8">
        <h2 className="text-lg font-semibold">Komentar</h2>
        {comments.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                <p className="text-sm font-semibold">{comment.user?.name ?? "Supporter"}</p>
                <p className="mt-2 text-sm text-neutral-700">{comment.body}</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {format(comment.createdAt, "dd MMM yyyy HH:mm")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
