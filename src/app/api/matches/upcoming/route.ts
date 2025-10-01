import { NextResponse } from "next/server";
import { listUpcomingMatches } from "@/server/services/matches";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "5");
  try {
    const matches = await listUpcomingMatches(limit);
    return NextResponse.json(matches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
