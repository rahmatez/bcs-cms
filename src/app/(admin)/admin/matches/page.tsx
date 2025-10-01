import Link from "next/link";

import { auth } from "@/lib/auth";
import { listMatchesAdmin } from "@/server/services/matches";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "SCHEDULED", label: "Terjadwal" },
  { value: "LIVE", label: "Live" },
  { value: "FINISHED", label: "Selesai" },
  { value: "POSTPONED", label: "Ditunda" }
] as const;

const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: "bg-neutral-200 text-neutral-600",
  LIVE: "bg-amber-100 text-amber-700",
  FINISHED: "bg-emerald-100 text-emerald-700",
  POSTPONED: "bg-red-100 text-red-600"
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

interface AdminMatchesPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AdminMatchesPage({ searchParams }: AdminMatchesPageProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MATCH_ADMIN"].includes(role)) {
    return null;
  }

  const rawStatus = typeof searchParams?.status === "string" ? searchParams.status.toUpperCase() : "ALL";
  const status = STATUS_OPTIONS.find((option) => option.value === rawStatus)?.value ?? "ALL";
  const competition = typeof searchParams?.competition === "string" ? searchParams.competition : undefined;

  const matches = await listMatchesAdmin({
    status: status === "ALL" ? "ALL" : (status as typeof STATUS_OPTIONS[number]["value"]),
    competition
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Jadwal pertandingan</h1>
          <p className="text-sm text-neutral-500">Kelola jadwal, skor akhir, dan highlight pertandingan.</p>
        </div>
        <Link
          href="/admin/matches/new"
          className="button-base inline-flex items-center gap-2 bg-primary text-primary-foreground"
        >
          Jadwal baru
        </Link>
      </section>

      <form className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-[1fr,1fr,auto]">
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          name="competition"
          defaultValue={competition ?? ""}
          placeholder="Filter kompetisi"
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button type="submit" className="button-base bg-neutral-900 text-white">
          Terapkan
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[1.5fr,1fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Pertandingan</span>
          <span>Waktu</span>
          <span>Status</span>
          <span>Skor</span>
        </div>
        {matches.length === 0 && (
          <p className="px-5 py-6 text-sm text-neutral-500">Belum ada jadwal sesuai filter.</p>
        )}
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/admin/matches/${match.id}`}
            className="grid grid-cols-[1.5fr,1fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-4 text-sm transition hover:bg-neutral-50"
          >
            <div>
              <p className="font-medium text-neutral-900">BCS vs {match.opponent}</p>
              <p className="text-xs text-neutral-500">{match.venue}</p>
              <p className="text-xs text-neutral-500">{match.competition}</p>
            </div>
            <div className="text-xs text-neutral-500">{formatDate(match.eventDate)}</div>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  STATUS_CLASS[match.status] ?? "bg-neutral-200 text-neutral-600"
                }`}
              >
                {match.status}
              </span>
            </div>
            <div className="text-sm font-semibold text-neutral-900">
              {match.scoreHome ?? "-"} : {match.scoreAway ?? "-"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
