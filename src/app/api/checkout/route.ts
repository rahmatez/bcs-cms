import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkout as checkoutService } from "@/server/services/store";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const order = await checkoutService({ userId: session.user.id, input: body });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
