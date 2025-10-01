import { NextResponse } from "next/server";
import { getMatch } from "@/server/services/matches";

interface Params {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const match = await getMatch(params.slug);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json(match);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
  }
}
