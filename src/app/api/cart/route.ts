import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/server/services/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await getOrCreateCart(session.user.id);
  return NextResponse.json(cart);
}
