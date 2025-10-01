import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

const ADMIN_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.CONTENT_ADMIN,
  Role.MATCH_ADMIN,
  Role.MERCH_ADMIN,
  Role.FINANCE,
  Role.MODERATOR
];

export default auth(async (req) => {
  const { nextUrl } = req;
  if (!nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!req.auth?.user?.role || !ADMIN_ROLES.includes(req.auth.user.role as Role)) {
    const signInUrl = new URL("/auth/login", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"]
};
