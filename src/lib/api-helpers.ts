import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { canAccess } from "@/lib/rbac";

export async function requireApiRole(roles: Role[]): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user?.role || !canAccess(roles, session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
