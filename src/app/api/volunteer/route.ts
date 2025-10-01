import { NextResponse } from "next/server";
import { submitVolunteer, volunteerSchema } from "@/server/services/interaction";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = volunteerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const volunteer = await submitVolunteer(parsed.data);
  return NextResponse.json(volunteer, { status: 201 });
}
