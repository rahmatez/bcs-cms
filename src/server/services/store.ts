import { prisma } from "@/lib/prisma";
import { CommentStatus, CouponType, OrderStatus, ProductStatus, Role, Prisma } from "@prisma/client";
import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  basePrice: z.number().int().positive(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  coverUrl: z.string().url().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        sku: z.string().min(2),
        optionJson: z.record(z.string()),
        stock: z.number().int().nonnegative(),
        price: z.number().int().positive()
      })
    )
    .min(1)
});

export const cartItemSchema = z.object({
  productVariantId: z.string(),
  qty: z.number().int().min(1).max(10)
});

export async function listProducts(params: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const { query, page = 1, pageSize = 12 } = params;
  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
      { description: { contains: query, mode: Prisma.QueryMode.insensitive } }
    ];
  }
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.product.count({ where })
  ]);
  return { items, total, page, pageSize };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true }
  });

  if (!product) {
    return null;
  }

  const comments = await prisma.comment.findMany({
    where: {
      refType: "PRODUCT",
      refId: product.id,
      status: CommentStatus.APPROVED
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } }
    }
  });

  return {
    ...product,
    comments
  };
}

export async function upsertProduct({
  data,
  productId
}: {
  data: z.infer<typeof productInputSchema>;
  productId?: string;
}) {
  const payload = productInputSchema.parse(data);

  const result = await prisma.$transaction(async (tx) => {
    const product = productId
      ? await tx.product.update({
          where: { id: productId },
          data: {
            name: payload.name,
            slug: payload.slug,
            description: payload.description,
            basePrice: payload.basePrice,
            status: payload.status,
            coverUrl: payload.coverUrl
          }
        })
      : await tx.product.create({
          data: {
            name: payload.name,
            slug: payload.slug,
            description: payload.description,
            basePrice: payload.basePrice,
            status: payload.status,
            coverUrl: payload.coverUrl
          }
        });

    // sync variants
    const existing = await tx.productVariant.findMany({ where: { productId: product.id } });
    const incomingIds: string[] = payload.variants
      .filter((variant): variant is typeof payload.variants[number] & { id: string } => Boolean(variant.id))
      .map((variant) => variant.id);

    const toDelete = existing.filter((variant) => !incomingIds.includes(variant.id));
    if (toDelete.length) {
      await tx.productVariant.deleteMany({
        where: { id: { in: toDelete.map((variant) => variant.id) } }
      });
    }

    for (const variant of payload.variants) {
      if (variant.id) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: variant.sku,
            optionJson: variant.optionJson,
            stock: variant.stock,
            price: variant.price
          }
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku,
            optionJson: variant.optionJson,
            stock: variant.stock,
            price: variant.price
          }
        });
      }
    }

    return product;
  });

  return result;
}

type CartWithItems = Prisma.CartGetPayload<{ include: { items: true } }>;
type CartWithItemsAndVariants = Prisma.CartGetPayload<{
  include: { items: { include: { variant: true } } };
}>;

export async function getOrCreateCart(userId: string): Promise<CartWithItems> {
  const existing = await prisma.cart.findFirst({ where: { userId }, include: { items: true } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId }, include: { items: true } });
}

export async function addItemToCart({ userId, input }: { userId: string; input: z.infer<typeof cartItemSchema> }) {
  const payload = cartItemSchema.parse(input);
  const variant = await prisma.productVariant.findUnique({ where: { id: payload.productVariantId } });
  if (!variant) {
    throw new Error("Variant not found");
  }
  if (variant.stock < payload.qty) {
    throw new Error("Insufficient stock");
  }

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find(
    (item: CartWithItems["items"][number]) => item.productVariantId === variant.id
  );

  if (existing) {
    const newQty = existing.qty + payload.qty;
    if (newQty > variant.stock) {
      throw new Error("Insufficient stock");
    }
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { qty: newQty }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId: variant.id,
        qty: payload.qty
      }
    });
  }

  return getOrCreateCart(userId);
}

export async function updateCartItem({
  userId,
  itemId,
  qty
}: {
  userId: string;
  itemId: string;
  qty: number;
}) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((cartItem) => cartItem.id === itemId);
  if (!item) {
    throw new Error("Item not found");
  }

  if (qty <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return getOrCreateCart(userId);
  }

  const variant = await prisma.productVariant.findUnique({ where: { id: item.productVariantId } });
  if (!variant || variant.stock < qty) {
    throw new Error("Insufficient stock");
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { qty } });
  return getOrCreateCart(userId);
}

export async function removeCartItem({ userId, itemId }: { userId: string; itemId: string }) {
  await getOrCreateCart(userId);
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getOrCreateCart(userId);
}

const checkoutSchema = z.object({
  paymentMethod: z.enum(["TRANSFER", "QRIS"]),
  shippingAddress: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    postalCode: z.string().min(4)
  }),
  couponCode: z.string().optional(),
  paymentProofUrl: z.string().url().optional()
});

export async function checkout({
  userId,
  input
}: {
  userId: string;
  input: z.infer<typeof checkoutSchema>;
}) {
  const payload = checkoutSchema.parse(input);
  const cart = (await prisma.cart.findFirst({
    where: { userId },
    include: { items: { include: { variant: { include: { product: true } } } } }
  })) as CartWithItemsAndVariants | null;

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const totals = cart.items.reduce<{ total: number }>((acc, item) => {
    acc.total += item.qty * item.variant.price;
    return acc;
  }, { total: 0 });

  let discount = 0;
  let couponId: string | undefined;

  if (payload.couponCode) {
    const now = new Date();
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: payload.couponCode,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
        ]
      }
    });

    if (!coupon) {
      throw new Error("Coupon invalid");
    }

    if (coupon.usageLimit && coupon.used >= coupon.usageLimit) {
      throw new Error("Coupon limit reached");
    }

    if (coupon.minSpend && totals.total < coupon.minSpend) {
      throw new Error("Minimum spend not met");
    }

    discount =
      coupon.type === CouponType.PERCENT
        ? Math.floor((coupon.value / 100) * totals.total)
        : coupon.value;

    couponId = coupon.id;
  }

  const finalTotal = Math.max(totals.total - discount, 0);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        couponId,
        total: totals.total,
        discount,
        finalTotal,
        status: OrderStatus.PENDING,
        paymentMethod: payload.paymentMethod,
        paymentRef: payload.paymentProofUrl,
        shippingAddressJson: payload.shippingAddress
      }
    });

    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId: createdOrder.id,
        productVariantId: item.productVariantId,
        qty: item.qty,
        price: item.variant.price
      }))
    });

    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { decrement: item.qty } }
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { used: { increment: 1 } } });
    }

    return createdOrder;
  });

  return order;
}

export async function listOrders({
  userId,
  role,
  status
}: {
  userId: string;
  role: Role;
  status?: OrderStatus | "ALL";
}) {
  const where: Prisma.OrderWhereInput = {};

  if (!(role === Role.SUPER_ADMIN || role === Role.MERCH_ADMIN || role === Role.FINANCE)) {
    where.userId = userId;
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      items: {
        include: { variant: { include: { product: true } } }
      },
      shipment: true
    }
  });
}

export async function listAdminProducts({
  query,
  status = "ALL"
}: {
  query?: string;
  status?: "ALL" | ProductStatus;
}) {
  const where: Prisma.ProductWhereInput = {};

  if (status !== "ALL") {
    where.status = status;
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
      { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
      { variants: { some: { sku: { contains: query, mode: Prisma.QueryMode.insensitive } } } }
    ];
  }

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      variants: true
    }
  });
}

export async function listCoupons() {
  return prisma.coupon.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: {
        select: {
          orders: true
        }
      }
    }
  });
}

export async function getProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true
    }
  });
}

export async function updateOrderStatus({
  orderId,
  status
}: {
  orderId: string;
  status: OrderStatus;
}) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
}

export async function updateShipmentInfo({
  orderId,
  courier,
  trackingNumber,
  shippedAt
}: {
  orderId: string;
  courier?: string;
  trackingNumber?: string;
  shippedAt?: Date | null;
}) {
  return prisma.shipment.upsert({
    where: { orderId },
    update: {
      courier,
      trackingNumber,
      shippedAt: shippedAt ?? null
    },
    create: {
      orderId,
      courier,
      trackingNumber,
      shippedAt: shippedAt ?? null
    }
  });
}
