import { NextResponse } from "next/server";
import { upsertArticle, listArticles } from "@/server/services/articles";
import { requireApiRole } from "@/lib/api-helpers";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.CONTENT_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") as any;

  try {
    const data = await listArticles({ page, status });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.CONTENT_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const body = await request.json();

  try {
    const article = await upsertArticle({ data: body, authorId: sessionOrResponse.user?.id ?? "" });
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
