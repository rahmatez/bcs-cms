import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { PageHeroSlider } from "@/components/page-hero-slider";

export default async function MatchesPage() {
  const upcoming = await prisma.match.findMany({
    where: { status: { in: ["SCHEDULED", "LIVE"] } },
    orderBy: { eventDate: "asc" },
    take: 10
  });

  const past = await prisma.match.findMany({
    where: { status: "FINISHED" },
    orderBy: { eventDate: "desc" },
    take: 10
  });

  return (
    <>
      <PageHeroSlider
        title="Matches Schedule"
        subtitle="Pantau jadwal kandang dan tandang, skor akhir, serta highlight singkat"
        height="medium"
      />
      
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Akan Datang</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-neutral-400">Belum ada jadwal terdekat.</p>
          ) : (
            upcoming.map((match) => (
              <Link
                href={`/matches/${match.id}`}
                key={match.id}
                className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 shadow-sm transition hover:border-primary"
              >
                <p className="text-xs uppercase text-neutral-400">
                  {format(match.eventDate, "EEEE, dd MMM yyyy HH:mm")}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">BCS vs {match.opponent}</h3>
                <p className="text-sm text-neutral-400">{match.venue}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
                  {match.competition}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white">Hasil Terakhir</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {past.length === 0 ? (
            <p className="text-sm text-neutral-400">Belum ada pertandingan selesai.</p>
          ) : (
            past.map((match) => (
              <Link
                href={`/matches/${match.id}`}
                key={match.id}
                className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 shadow-sm transition hover:border-primary"
              >
                <p className="text-xs uppercase text-neutral-400">
                  {format(match.eventDate, "EEEE, dd MMM yyyy HH:mm")}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">BCS {match.scoreHome ?? "-"} : {match.scoreAway ?? "-"} {match.opponent}</h3>
                <p className="text-sm text-neutral-400">{match.venue}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
                  {match.competition}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
      </div>
    </>
  );
}
