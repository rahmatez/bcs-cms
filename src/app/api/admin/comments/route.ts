import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-helpers";
import { Role, CommentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.MODERATOR, Role.CONTENT_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as CommentStatus | null;

  const comments = await prisma.comment.findMany({
    where: {
      ...(status ? { status } : {})
    },
    include: {
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json(comments);
}
