import { prisma } from "@/lib/prisma";
import { ArticleStatus, Prisma } from "@prisma/client";
import { z } from "zod";

export const articleInputSchema = z.object({
  title: z.string().min(4),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  body: z.string().min(20),
  coverUrl: z.string().url().optional(),
  categories: z.array(z.string()).default([]),
  status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
  publishedAt: z.coerce.date().optional()
});

export async function listArticles(params: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  status?: ArticleStatus;
}) {
  const { query, category, page = 1, pageSize = 10, status } = params;

  const where: Prisma.ArticleWhereInput = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
      { body: { contains: query, mode: Prisma.QueryMode.insensitive } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          slug: category
        }
      }
    };
  }

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        author: {
          select: { id: true, name: true }
        }
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.article.count({ where })
  ]);

  return { items, total, page, pageSize };
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      categories: {
        include: { category: true }
      },
      author: {
        select: { id: true, name: true }
      }
    }
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      categories: {
        include: { category: true }
      },
      author: {
        select: { id: true, name: true }
      }
    }
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" }
  });
}

export async function upsertArticle({
  data,
  authorId,
  articleId
}: {
  data: z.infer<typeof articleInputSchema>;
  authorId: string;
  articleId?: string;
}) {
  const payload = articleInputSchema.parse(data);

  const categoryRecords = await prisma.category.findMany({
    where: { id: { in: payload.categories } },
    select: { id: true }
  });

  if (payload.categories.length && categoryRecords.length !== payload.categories.length) {
    throw new Error("Invalid categories");
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const article = articleId
      ? await tx.article.update({
          where: { id: articleId },
          data: {
            title: payload.title,
            slug: payload.slug,
            excerpt: payload.excerpt,
            body: payload.body,
            coverUrl: payload.coverUrl,
            status: payload.status,
            publishedAt: payload.publishedAt
          }
        })
      : await tx.article.create({
          data: {
            title: payload.title,
            slug: payload.slug,
            excerpt: payload.excerpt,
            body: payload.body,
            coverUrl: payload.coverUrl,
            status: payload.status,
            publishedAt: payload.publishedAt,
            authorId
          }
        });

    await tx.articleCategory.deleteMany({ where: { articleId: article.id } });

    if (payload.categories.length) {
      await tx.articleCategory.createMany({
        data: payload.categories.map((categoryId: string) => ({
          articleId: article.id,
          categoryId
        }))
      });
    }

    return article;
  });

  return result;
}

export async function deleteArticle(articleId: string) {
  return prisma.article.delete({ where: { id: articleId } });
}
