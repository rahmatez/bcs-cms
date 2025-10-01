import { NextResponse } from "next/server";
import { newsletterSchema, subscribeNewsletter } from "@/server/services/interaction";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  }
  const subscriber = await subscribeNewsletter(parsed.data);
  return NextResponse.json(subscriber, { status: 201 });
}
