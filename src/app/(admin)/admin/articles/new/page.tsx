import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { listCategories } from "@/server/services/articles";
import { ArticleForm } from "../_components/article-form";
import { Role } from "@prisma/client";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.CONTENT_ADMIN] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

export default async function AdminArticleCreatePage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!hasAccess(role)) {
    redirect("/admin");
  }

  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Tulis Artikel</h1>
        <p className="text-sm text-neutral-500">Bagikan kabar terbaru untuk seluruh Brigata Curva Sud.</p>
      </div>
      <ArticleForm categories={categories} />
    </div>
  );
}
