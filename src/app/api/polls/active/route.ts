import { NextResponse } from "next/server";
import { getActivePoll } from "@/server/services/interaction";

export async function GET() {
  const poll = await getActivePoll();
  return NextResponse.json(poll);
}
