import { NextResponse } from "next/server";
import { listProducts } from "@/server/services/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "12");

  const products = await listProducts({ query: query ?? undefined, page, pageSize });
  return NextResponse.json(products);
}
