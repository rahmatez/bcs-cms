import { NextResponse } from "next/server";
import { getProductBySlug } from "@/server/services/store";

interface Params {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: Params) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
