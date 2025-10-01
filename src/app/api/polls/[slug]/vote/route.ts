import { NextResponse } from "next/server";
import { votePoll } from "@/server/services/interaction";
import { auth } from "@/lib/auth";
import crypto from "crypto";

interface Params {
  params: { id: string };
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  const body = await request.json();
  const optionKey = body.optionKey as string | undefined;

  if (!optionKey) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  try {
    const vote = await votePoll({
      pollId: params.id,
      optionKey,
      userId: session?.user?.id,
      ipHash
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
