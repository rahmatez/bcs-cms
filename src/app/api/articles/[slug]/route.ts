import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/server/services/articles";

interface Params {
  params: { slug: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const article = await getArticleBySlug(params.slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}
