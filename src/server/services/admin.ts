import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function getAdminDashboardSnapshot() {
  const now = new Date();
  const last30Days = subDays(now, 30);

  const [
    totalArticles,
    publishedArticles,
    pendingComments,
    upcomingMatches,
    totalProducts,
    pendingOrders,
    newVolunteers,
    newSubscribers,
    revenueAggregation,
    recentOrders,
    lowStockVariants
  ] = await Promise.all([
    prisma.article.count(),
  prisma.article.count({ where: { status: "PUBLISHED" } }),
  prisma.comment.count({ where: { status: "PENDING" } }),
  prisma.match.count({ where: { eventDate: { gte: now }, status: { in: ["SCHEDULED", "LIVE"] } } }),
    prisma.product.count(),
  prisma.order.count({ where: { status: "PENDING" } }),
    prisma.volunteer.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.newsletterSubscriber.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.order.aggregate({
      _sum: { finalTotal: true },
      where: {
        status: {
          in: ["PAID", "PACKED", "SHIPPED", "COMPLETED"]
        },
        createdAt: { gte: last30Days }
      }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        finalTotal: true,
        paymentMethod: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        items: {
          select: {
            qty: true
          }
        }
      }
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
  ]);

  const revenueLast30Days = revenueAggregation._sum.finalTotal ?? 0;

  return {
    totals: {
      articles: totalArticles,
      publishedArticles,
      products: totalProducts,
      upcomingMatches,
      pendingComments,
      pendingOrders,
      newVolunteers,
      newSubscribers
    },
    revenueLast30Days,
    recentOrders,
    lowStockVariants
  };
}
