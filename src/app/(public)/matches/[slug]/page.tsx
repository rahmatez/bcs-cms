import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { PageHeroSlider } from "@/components/page-hero-slider";

export default async function MatchDetail({ params }: { params: { slug: string } }) {
  const match = await prisma.match.findUnique({ where: { id: params.slug } });

  if (!match) {
    notFound();
  }

  return (
    <>
      <PageHeroSlider
        title={`BCS vs ${match.opponent}`}
        subtitle={`${format(match.eventDate, "dd MMM yyyy")} • ${match.venue}`}
        height="small"
      />
      
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/matches" className="text-sm text-secondary-600 hover:text-secondary-700">← Kembali ke Jadwal</Link>
        <div className="mt-8 space-y-2">
          <div className="text-sm text-neutral-400">
            {format(match.eventDate, "EEEE, HH:mm")} • {match.competition}
          </div>
          <div className="text-lg font-semibold text-white">
            Skor: {match.scoreHome ?? "-"} : {match.scoreAway ?? "-"}
          </div>
        </div>

      {match.highlightText ? (
        <section className="mt-10 rounded-xl border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white">Highlight</h2>
          <p className="mt-2 text-sm text-neutral-300">{match.highlightText}</p>
          {match.highlightUrl ? (
            <a
              href={match.highlightUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm text-secondary-600 hover:text-secondary-700"
            >
              Lihat video highlight →
            </a>
          ) : null}
        </section>
      ) : null}
      </article>
    </>
  );
}
