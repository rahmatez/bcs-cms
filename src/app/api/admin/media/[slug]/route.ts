import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { deleteMedia } from "@/server/services/media";

const ALLOWED_ROLES = ["SUPER_ADMIN", "CONTENT_ADMIN"] as const;

function ensureAccess(role?: string | null): role is typeof ALLOWED_ROLES[number] {
  return !!role && ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number]);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!ensureAccess(session?.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await deleteMedia(params.id);
  return NextResponse.json({ ok: true });
}
