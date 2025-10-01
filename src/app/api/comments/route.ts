import { NextResponse } from "next/server";
import { commentSchema, listComments, submitComment } from "@/server/services/interaction";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refType = searchParams.get("refType") as "ARTICLE" | "PRODUCT" | null;
  const refId = searchParams.get("refId");

  if (!refType || !refId) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const comments = await listComments({ refType, refId });
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rate = rateLimit({ key: `comment:${session.user.id}:${ip}`, limit: 5 });
  if (!rate.success) {
    return NextResponse.json(
      { error: "Terlalu banyak komentar. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } }
    );
  }

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const result = await submitComment({ userId: session.user.id, input: parsed.data });
  return NextResponse.json(result, { status: 201 });
}
