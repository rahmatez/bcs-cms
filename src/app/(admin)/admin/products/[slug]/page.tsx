import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getProductById } from "@/server/services/store";
import { ProductForm } from "../_components/product-form";
import type { ProductFormValues } from "../_schema";
import { Role } from "@prisma/client";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.MERCH_ADMIN] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

function extractVariantLabel(optionJson: unknown, fallback: string) {
  if (!optionJson || typeof optionJson !== "object" || Array.isArray(optionJson)) {
    return fallback;
  }

  const record = optionJson as Record<string, unknown>;
  const labelValue = record.label;
  if (typeof labelValue === "string" && labelValue.length > 0) {
    return labelValue;
  }

  const firstString = Object.values(record).find((value): value is string => typeof value === "string");
  return firstString ?? fallback;
}

interface AdminProductDetailPageProps {
  params: { id: string };
}

export default async function AdminProductDetailPage({ params }: AdminProductDetailPageProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!hasAccess(role)) {
    redirect("/admin");
  }

  const product = await getProductById(params.id);
  if (!product) {
    notFound();
  }

  const initialValues: ProductFormValues = {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    basePrice: product.basePrice,
    status: product.status,
    coverUrl: product.coverUrl ?? "",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: extractVariantLabel(variant.optionJson, variant.sku),
      sku: variant.sku,
      stock: variant.stock,
      price: variant.price
    }))
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Edit Produk</h1>
        <p className="text-sm text-neutral-500">Perbarui detail dan stok untuk merchandise ini.</p>
      </div>
      <ProductForm productId={product.id} initialValues={initialValues} />
    </div>
  );
}
