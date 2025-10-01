import { NextResponse } from "next/server";
import { upsertArticle, deleteArticle } from "@/server/services/articles";
import { requireApiRole } from "@/lib/api-helpers";
import { Role } from "@prisma/client";

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.CONTENT_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const body = await request.json();

  try {
    const article = await upsertArticle({
      data: body,
      authorId: sessionOrResponse.user?.id ?? "",
      articleId: params.id
    });
    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.CONTENT_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  try {
    await deleteArticle(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
