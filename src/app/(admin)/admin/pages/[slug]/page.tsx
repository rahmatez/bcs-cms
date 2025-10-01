import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { getPageById } from "@/server/services/pages";
import { PageForm } from "../_components/page-form";

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  const iso = value.toISOString();
  return iso.slice(0, 16);
}

interface AdminPageDetailProps {
  params: { id: string };
}

export default async function AdminPageDetail({ params }: AdminPageDetailProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(role)) {
    return null;
  }

  const page = await getPageById(params.id);
  if (!page) {
    notFound();
  }

  const initialValues = {
    title: page.title,
    slug: page.slug,
    body: page.body,
    status: page.status,
    publishedAt: formatDateInput(page.publishedAt ?? null)
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Edit halaman</h1>
        <p className="text-sm text-neutral-500">Atur konten dan status publikasi.</p>
      </div>
      <PageForm pageId={page.id} initialValues={initialValues} />
    </div>
  );
}
