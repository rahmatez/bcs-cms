import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { requireApiRole } from "@/lib/api-helpers";
import { listNewsletterSubscribers } from "@/server/services/interaction";

export async function GET() {
  const sessionOrResponse = await requireApiRole([Role.SUPER_ADMIN, Role.MODERATOR, Role.CONTENT_ADMIN]);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const subscribers = await listNewsletterSubscribers();

  const header = "email,verified,created_at";
  const rows = subscribers.map((subscriber) => {
    const createdAt = subscriber.createdAt.toISOString();
    return `${subscriber.email},${subscriber.verified ? "yes" : "no"},${createdAt}`;
  });

  const csvContent = [header, ...rows].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-subscribers.csv"`
    }
  });
}
