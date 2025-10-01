import { NextResponse } from "next/server";
import { listArticles } from "@/server/services/articles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const query = searchParams.get("query") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  try {
    const data = await listArticles({ page, query, category });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
