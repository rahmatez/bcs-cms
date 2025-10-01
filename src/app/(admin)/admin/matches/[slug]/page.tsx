import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { getMatch } from "@/server/services/matches";
import { MatchForm } from "../_components/match-form";

function formatDateInput(date: Date) {
  const iso = date.toISOString();
  return iso.slice(0, 16);
}

interface AdminMatchDetailProps {
  params: { id: string };
}

export default async function AdminMatchDetail({ params }: AdminMatchDetailProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MATCH_ADMIN"].includes(role)) {
    return null;
  }

  const match = await getMatch(params.id);
  if (!match) {
    notFound();
  }

  const initialValues = {
    opponent: match.opponent,
    eventDate: formatDateInput(match.eventDate),
    venue: match.venue,
    competition: match.competition,
    status: match.status,
    scoreHome: match.scoreHome != null ? String(match.scoreHome) : "",
    scoreAway: match.scoreAway != null ? String(match.scoreAway) : "",
    highlightText: match.highlightText ?? "",
    highlightUrl: match.highlightUrl ?? ""
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Edit pertandingan</h1>
        <p className="text-sm text-neutral-500">Perbarui status, skor akhir, atau highlight.</p>
      </div>
      <MatchForm matchId={match.id} initialValues={initialValues} />
    </div>
  );
}
