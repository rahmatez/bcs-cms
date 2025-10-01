import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeCartItem, updateCartItem } from "@/server/services/store";

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const qty = Number(body.qty);
  if (Number.isNaN(qty)) {
    return NextResponse.json({ error: "Jumlah tidak valid" }, { status: 400 });
  }

  try {
    const cart = await updateCartItem({ userId: session.user.id, itemId: params.id, qty });
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cart = await removeCartItem({ userId: session.user.id, itemId: params.id });
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
