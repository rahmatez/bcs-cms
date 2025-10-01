import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ProductForm } from "../_components/product-form";
import { Role } from "@prisma/client";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.MERCH_ADMIN] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

export default async function AdminProductCreatePage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!hasAccess(role)) {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Tambah Produk</h1>
        <p className="text-sm text-neutral-500">Lengkapi detail merchandise untuk supporter BCS.</p>
      </div>
      <ProductForm />
    </div>
  );
}
