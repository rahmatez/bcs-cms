"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { productFormSchema, type ProductFormValues } from "./_schema";
import { upsertProduct } from "@/server/services/store";
import { recordAuditLog } from "@/server/services/audit";

const ALLOWED_ROLES: ReadonlySet<Role> = new Set([Role.SUPER_ADMIN, Role.MERCH_ADMIN]);

type SaveProductPayload = ProductFormValues & { productId?: string };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan";
}

export async function saveProductAction(payload: SaveProductPayload) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!role || !actorId || !ALLOWED_ROLES.has(role)) {
    return { ok: false, message: "Anda tidak memiliki akses" };
  }

  const { productId, ...raw } = payload;
  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const message = flat.fieldErrors?.name?.[0] ?? flat.formErrors[0] ?? "Data tidak valid";
    return { ok: false, message };
  }

  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description?.trim() || undefined,
    basePrice: parsed.data.basePrice,
    status: parsed.data.status,
    coverUrl: parsed.data.coverUrl ? parsed.data.coverUrl : undefined,
    variants: parsed.data.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      optionJson: {
        label: variant.label
      }
    }))
  };

  try {
    const result = await upsertProduct({ data, productId });
    await recordAuditLog({
      actorId,
      action: productId ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
      targetType: "PRODUCT",
      targetId: result.id,
      meta: {
        slug: result.slug,
        status: result.status
      }
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${result.id}`);
    return { ok: true, productId: result.id, slug: result.slug };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
