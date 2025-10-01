import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "@/components/newsletter-form";
import { PollWidget } from "@/components/poll-widget";
import { VolunteerForm } from "@/components/volunteer-form";

async function getData() {
  const [articles, matches, products, poll] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 4
    }),
    prisma.match.findMany({
      where: { eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 3
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { variants: true }
    }),
    prisma.poll.findFirst({
      where: {
        status: "ACTIVE",
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }
        ]
      },
      include: { votes: true }
    })
  ]);

  return { articles, matches, products, poll };
}

export default async function HomePage() {
  const { articles, matches, products, poll } = await getData();

  const [hero, ...restArticles] = articles;

  return (
    <div className="space-y-16">
      <section className="bg-neutral-900 text-neutral-100">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Brigata Curva Sud</p>
            <h1 className="mt-4 text-3xl font-display font-semibold sm:text-4xl">
              Bersatu untuk mendukung kebanggaan Yogya.
            </h1>
            <p className="mt-4 text-neutral-300">
              Portal resmi untuk berita terbaru, jadwal pertandingan, dan merchandise resmi BCS.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="button-base bg-primary text-primary-foreground" href="/news">
                Baca Berita
              </Link>
              <Link className="button-base border border-neutral-100/30" href="/store">
                Belanja Merchandise
              </Link>
            </div>
          </div>
          {hero ? (
            <article className="rounded-xl border border-white/10 bg-black/20 p-6 shadow-lg">
              <p className="text-xs uppercase text-neutral-400">Highlight</p>
              <h2 className="mt-2 text-2xl font-display font-semibold">
                <Link href={`/news/${hero.slug}`}>{hero.title}</Link>
              </h2>
              <p className="mt-3 text-sm text-neutral-300">
                {hero.excerpt ?? hero.body.slice(0, 140)}...
              </p>
              <Link className="mt-6 inline-flex text-sm text-primary" href={`/news/${hero.slug}`}>
                Baca selengkapnya →
              </Link>
            </article>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-semibold">Berita Terbaru</h2>
          <Link href="/news" className="text-sm text-primary">
            Lihat semua
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(hero ? restArticles : articles).map((article) => (
            <article key={article.id} className="rounded-xl border border-neutral-200 bg-white p-6">
              <p className="text-xs uppercase text-neutral-500">
                {article.publishedAt ? format(article.publishedAt, "dd MMM yyyy") : "Draft"}
              </p>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/news/${article.slug}`} className="hover:text-primary">
                  {article.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm text-neutral-600">
                {article.excerpt ?? article.body.slice(0, 120)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-neutral-100 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-semibold">Jadwal Terdekat</h2>
            <Link href="/matches" className="text-sm text-primary">
              Kalender pertandingan
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {matches.length === 0 ? (
              <p className="text-sm text-neutral-600">Belum ada jadwal terdekat.</p>
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  className={cn(
                    "rounded-lg border border-neutral-200 bg-white p-5",
                    match.status === "LIVE" && "border-primary"
                  )}
                >
                  <p className="text-xs text-neutral-500">
                    {format(match.eventDate, "EEEE, dd MMM yyyy HH:mm")}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">BCS vs {match.opponent}</h3>
                  <p className="text-sm text-neutral-600">{match.venue}</p>
                  <p className="mt-4 inline-flex items-center text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {match.competition}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-semibold">Merchandise Terbaru</h2>
          <Link href="/store" className="text-sm text-primary">
            Lihat semua produk
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-xl border border-neutral-200 bg-white p-6">
              <p className="text-xs uppercase text-neutral-500">{product.slug}</p>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/store/${product.slug}`} className="hover:text-primary">
                  {product.name}
                </Link>
              </h3>
              <p className="mt-3 text-sm text-neutral-600 line-clamp-3">
                {product.description ?? "Merchandise resmi Brigata Curva Sud."}
              </p>
              <p className="mt-4 text-base font-semibold">
                Rp{Math.min(...product.variants.map((v) => v.price)).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-900 py-16 text-neutral-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Volunteer</p>
            <h2 className="mt-3 text-3xl font-display font-semibold">Gabung jadi kontributor</h2>
            <p className="mt-3 text-sm text-neutral-300">
              Isi form singkat ini untuk bantu produksi konten, dokumentasi, merch, hingga kegiatan sosial.
            </p>
            <div className="mt-6">
              <VolunteerForm />
            </div>
          </div>
          <div className="space-y-8">
            {poll ? (
              <PollWidget
                pollId={poll.id}
                question={poll.question}
                options={Object.entries(poll.optionsJson as Record<string, string>).map(([key, label]) => ({
                  key,
                  label,
                  votes: (poll.votes ?? []).filter((vote) => vote.optionKey === key).length
                }))}
              />
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
                <p className="text-sm text-neutral-400">Tidak ada polling aktif sekarang.</p>
              </div>
            )}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Newsletter</p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-50">
                Dapatkan update matchday dan rilisan terbaru.
              </h3>
              <p className="mt-2 text-sm text-neutral-400">
                Kami kirim rangkuman penting setiap pekan. Tanpa spam.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
