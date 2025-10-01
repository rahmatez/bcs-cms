import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addItemToCart, cartItemSchema } from "@/server/services/store";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  try {
    const cart = await addItemToCart({ userId: session.user.id, input: parsed.data });
    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
