import { NextResponse } from "next/server";
import { listPastMatches } from "@/server/services/matches";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  try {
    const matches = await listPastMatches({ page, pageSize });
    return NextResponse.json(matches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
