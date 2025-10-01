import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-helpers";
import { Role, CommentStatus } from "@prisma/client";
import { moderateComment } from "@/server/services/interaction";

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.MODERATOR, Role.CONTENT_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const body = await request.json();
  const status = body.status as CommentStatus;

  if (!status || !Object.values(CommentStatus).includes(status)) {
    return NextResponse.json({ error: "Status invalid" }, { status: 400 });
  }

  const comment = await moderateComment({ commentId: params.id, status });
  return NextResponse.json(comment);
}
