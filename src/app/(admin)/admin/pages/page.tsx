import Link from "next/link";

import { auth } from "@/lib/auth";
import { listPagesAdmin } from "@/server/services/pages";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Terbit"
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-neutral-200 text-neutral-600",
  PUBLISHED: "bg-emerald-100 text-emerald-700"
};

export default async function AdminPagesIndex() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(role)) {
    return null;
  }

  const pages = await listPagesAdmin();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Halaman statis</h1>
          <p className="text-sm text-neutral-500">Kelola konten About, Tifo, Chants, dan lainnya.</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="button-base inline-flex items-center gap-2 bg-primary text-primary-foreground"
        >
          Buat halaman
        </Link>
      </section>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[2fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Halaman</span>
          <span>Status</span>
          <span>Publikasi</span>
        </div>
        {pages.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Belum ada halaman statis.</p>}
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/admin/pages/${page.id}`}
            className="grid grid-cols-[2fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-4 text-sm transition hover:bg-neutral-50"
          >
            <div>
              <p className="font-medium text-neutral-900">{page.title}</p>
              <p className="text-xs text-neutral-500">/pages/{page.slug}</p>
            </div>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  STATUS_CLASS[page.status] ?? "bg-neutral-200 text-neutral-600"
                }`}
              >
                {STATUS_LABEL[page.status] ?? page.status}
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {page.publishedAt
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(page.publishedAt)
                : "Belum dijadwalkan"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
