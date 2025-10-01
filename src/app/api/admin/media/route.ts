import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createMediaEntry, listMedia, mediaInputSchema } from "@/server/services/media";

const ALLOWED_ROLES = ["SUPER_ADMIN", "CONTENT_ADMIN"] as const;

function ensureAccess(role?: string | null): role is typeof ALLOWED_ROLES[number] {
  return !!role && ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number]);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!ensureAccess(session?.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const query = searchParams.get("query") ?? undefined;

  const result = await listMedia({ page, pageSize, query });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !ensureAccess(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const ip = request.headers.get("X-Forwarded-For") ?? "unknown";
  const result = rateLimit({ key: `admin-media:${ip}`, limit: 30 });
  if (!result.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = mediaInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const media = await createMediaEntry({ data: parsed.data, userId: session.user.id });
  return NextResponse.json({ media });
}