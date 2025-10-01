import { NextResponse } from "next/server";
import { listUpcomingMatches, listPastMatches, upsertMatch } from "@/server/services/matches";
import { requireApiRole } from "@/lib/api-helpers";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.MATCH_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "upcoming";

  try {
    if (type === "past") {
      const page = Number(searchParams.get("page") ?? "1");
      const pageSize = Number(searchParams.get("pageSize") ?? "10");
      const matches = await listPastMatches({ page, pageSize });
      return NextResponse.json(matches);
    }
    const limit = Number(searchParams.get("limit") ?? "10");
    const matches = await listUpcomingMatches(limit);
    return NextResponse.json(matches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.MATCH_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const body = await request.json();

  try {
    const match = await upsertMatch(body);
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
