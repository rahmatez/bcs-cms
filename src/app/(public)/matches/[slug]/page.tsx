import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";

export default async function MatchDetail({ params }: { params: { slug: string } }) {
  const match = await prisma.match.findUnique({ where: { id: params.slug } });

  if (!match) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/matches" className="text-sm text-primary">← Kembali</Link>
      <header className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Pertandingan</p>
        <h1 className="text-3xl font-display font-semibold">BCS vs {match.opponent}</h1>
        <div className="text-sm text-neutral-500">
          {format(match.eventDate, "EEEE, dd MMM yyyy HH:mm")} • {match.venue} • {match.competition}
        </div>
        <div className="text-lg font-semibold">
          Skor: {match.scoreHome ?? "-"} : {match.scoreAway ?? "-"}
        </div>
      </header>

      {match.highlightText ? (
        <section className="mt-10 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Highlight</h2>
          <p className="mt-2 text-sm text-neutral-700">{match.highlightText}</p>
          {match.highlightUrl ? (
            <a
              href={match.highlightUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm text-primary"
            >
              Lihat video highlight →
            </a>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
