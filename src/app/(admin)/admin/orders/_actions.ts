"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { OrderStatus, Role } from "@prisma/client";
import { updateOrderStatus, updateShipmentInfo } from "@/server/services/store";
import { recordAuditLog } from "@/server/services/audit";

const ALLOWED_ROLES = [Role.SUPER_ADMIN, Role.MERCH_ADMIN, Role.FINANCE] as const;

function hasAccess(role?: Role | null) {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

export async function updateOrderStatusAction(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Tidak diizinkan" };
  }

  const orderId = formData.get("orderId");
  const status = formData.get("status");

  if (typeof orderId !== "string" || typeof status !== "string") {
    return { ok: false, message: "Data tidak valid" };
  }

  const nextStatus = Object.values(OrderStatus).find((value) => value === status);

  if (!nextStatus) {
    return { ok: false, message: "Status tidak dikenal" };
  }

  try {
    const order = await updateOrderStatus({ orderId, status: nextStatus });
    await recordAuditLog({
      actorId,
      action: "ORDER_STATUS_UPDATED",
      targetType: "ORDER",
      targetId: orderId,
      meta: { status: nextStatus }
    });
    revalidatePath("/admin/orders");
    return { ok: true, status: order.status };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan" };
  }
}

export async function updateShipmentAction(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  if (!hasAccess(role) || !actorId) {
    return { ok: false, message: "Tidak diizinkan" };
  }

  const orderId = formData.get("orderId");
  const courier = formData.get("courier");
  const trackingNumber = formData.get("trackingNumber");
  const shippedAt = formData.get("shippedAt");

  if (typeof orderId !== "string") {
    return { ok: false, message: "Data tidak valid" };
  }

  const courierValue = typeof courier === "string" && courier.length > 0 ? courier : undefined;
  const trackingNumberValue =
    typeof trackingNumber === "string" && trackingNumber.length > 0 ? trackingNumber : undefined;
  const shippedAtValue = typeof shippedAt === "string" && shippedAt.length > 0 ? new Date(shippedAt) : null;

  try {
    await updateShipmentInfo({
      orderId,
      courier: courierValue,
      trackingNumber: trackingNumberValue,
      shippedAt: shippedAtValue
    });
    await recordAuditLog({
      actorId,
      action: "SHIPMENT_UPDATED",
      targetType: "ORDER",
      targetId: orderId,
      meta:
        courierValue || trackingNumberValue
          ? {
              ...(courierValue ? { courier: courierValue } : {}),
              ...(trackingNumberValue ? { trackingNumber: trackingNumberValue } : {})
            }
          : null
    });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan" };
  }
}
