import { auth } from "@/lib/auth";
import { listAllComments } from "@/server/services/interaction";
import { prisma } from "@/lib/prisma";
import { moderateCommentAction } from "./_actions";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" }
] as const;

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600"
};

interface AdminCommentsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AdminCommentsPage({ searchParams }: AdminCommentsPageProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN"].includes(role)) {
    return null;
  }

  const rawStatus = typeof searchParams?.status === "string" ? searchParams.status.toUpperCase() : "ALL";
  const status = STATUS_OPTIONS.find((option) => option.value === rawStatus)?.value ?? "ALL";

  const comments = await listAllComments({ status: status === "ALL" ? "ALL" : (status as "PENDING" | "APPROVED" | "REJECTED") });

  const articleIds = comments.filter((comment) => comment.refType === "ARTICLE").map((comment) => comment.refId);
  const productIds = comments.filter((comment) => comment.refType === "PRODUCT").map((comment) => comment.refId);

  const [articles, products] = await Promise.all([
    articleIds.length
      ? prisma.article.findMany({
          where: { id: { in: Array.from(new Set(articleIds)) } },
          select: { id: true, title: true, slug: true }
        })
      : Promise.resolve([]),
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: Array.from(new Set(productIds)) } },
          select: { id: true, name: true, slug: true }
        })
      : Promise.resolve([])
  ]);

  const articleMap = new Map(articles.map((article) => [article.id, article]));
  const productMap = new Map(products.map((product) => [product.id, product]));

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Moderasi komentar</h1>
        <p className="text-sm text-neutral-500">Tinjau komentar supporter dan setujui yang layak tampil.</p>
      </section>

      <form className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center">
        <label className="text-sm text-neutral-500" htmlFor="status-filter">
          Status
        </label>
        <select
          id="status-filter"
          name="status"
          defaultValue={status}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-64"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="button-base bg-neutral-900 text-white">
          Terapkan
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[1.5fr,1fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Komentar</span>
          <span>Target</span>
          <span>Penulis</span>
          <span>Status</span>
        </div>
        {comments.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Belum ada komentar.</p>}
        {comments.map((comment) => {
          const targetInfo =
            comment.refType === "ARTICLE"
              ? articleMap.get(comment.refId)
              : comment.refType === "PRODUCT"
              ? productMap.get(comment.refId)
              : null;

          return (
            <div key={comment.id} className="grid grid-cols-[1.5fr,1fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
              <div>
                <p className="text-neutral-900">{comment.body}</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(comment.createdAt)}
                </p>
              </div>
              <div className="text-xs text-neutral-500">
                <p className="font-medium text-neutral-900">{comment.refType}</p>
                {targetInfo ? (
                  <p className="mt-1">
                    {"title" in targetInfo ? targetInfo.title : targetInfo.name}
                    {targetInfo.slug ? (
                      <span className="block text-neutral-400">/{comment.refType === "ARTICLE" ? "news" : "store"}/{targetInfo.slug}</span>
                    ) : null}
                  </p>
                ) : (
                  <p className="mt-1">ID: {comment.refId}</p>
                )}
              </div>
              <div className="text-xs text-neutral-500">
                <p className="font-medium text-neutral-900">{comment.user.name}</p>
                <p>{comment.user.email}</p>
              </div>
              <div className="space-y-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    STATUS_CLASS[comment.status] ?? "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {comment.status}
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {comment.status !== "APPROVED" && (
                    <form action={moderateCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="status" value="APPROVED" />
                      <input type="hidden" name="refType" value={comment.refType} />
                      <input type="hidden" name="refId" value={comment.refId} />
                      <button
                        type="submit"
                        className="rounded-md bg-emerald-600 px-3 py-2 font-medium text-white transition hover:bg-emerald-700"
                      >
                        Setujui
                      </button>
                    </form>
                  )}
                  {comment.status !== "REJECTED" && (
                    <form action={moderateCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <input type="hidden" name="refType" value={comment.refType} />
                      <input type="hidden" name="refId" value={comment.refId} />
                      <button
                        type="submit"
                        className="rounded-md bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </form>
                  )}
                  {comment.status !== "PENDING" && (
                    <form action={moderateCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="status" value="PENDING" />
                      <input type="hidden" name="refType" value={comment.refType} />
                      <input type="hidden" name="refId" value={comment.refId} />
                      <button
                        type="submit"
                        className="rounded-md border border-neutral-300 px-3 py-2 font-medium text-neutral-700 transition hover:bg-neutral-100"
                      >
                        Jadikan pending
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
