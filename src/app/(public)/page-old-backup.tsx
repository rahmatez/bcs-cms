import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar, Mail, MapPin, ShoppingBag, TrendingUp, Users, Zap } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { PollWidget } from "@/components/poll-widget";
import { VolunteerForm } from "@/components/volunteer-form";

async function getData() {
  const [articles, matches, products, poll] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark via-dark-100 to-dark-200 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-stadium-pattern opacity-5"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-400 backdrop-blur-sm border border-primary-500/20 mb-6">
                <Zap className="h-4 w-4" />
                <span>Official Website</span>
              </div>
              
              <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl mb-6">
                <span className="block text-white">BRIGATA</span>
                <span className="block bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                  CURVA SUD
                </span>
              </h1>
              
              <p className="text-xl text-neutral-300 mb-8 max-w-lg leading-relaxed">
                Bersatu dalam semangat, loyalitas, dan kebanggaan. 
                Portal resmi untuk berita, jadwal pertandingan, dan merchandise.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/news" 
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-base font-bold text-black transition-all duration-300 hover:bg-primary-400 hover:shadow-2xl hover:shadow-primary-500/50 hover:scale-105"
                >
                  Lihat Berita
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="/store" 
                  className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-primary-500 hover:bg-primary-500/10 hover:scale-105"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Official Store
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-primary-400">1000+</div>
                  <div className="text-sm text-neutral-400 mt-1">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-primary-400">50+</div>
                  <div className="text-sm text-neutral-400 mt-1">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-primary-400">10+</div>
                  <div className="text-sm text-neutral-400 mt-1">Years</div>
                </div>
              </div>
            </div>

            {/* Right Column - Featured Article */}
            {hero && (
              <div className="animate-scale-in">
                <Link 
                  href={`/news/${hero.slug}`}
                  className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/20"
                >
                  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl transition-all duration-500 group-hover:bg-primary-500/30"></div>
                  
                  <div className="relative">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-400">
                      <TrendingUp className="h-3 w-3" />
                      Featured Story
                    </div>
                    
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight group-hover:text-primary-400 transition-colors">
                      {hero.title}
                    </h2>
                    
                    <p className="text-neutral-300 mb-6 line-clamp-3 leading-relaxed">
                      {hero.excerpt ?? hero.body.slice(0, 150)}...
                    </p>
                    
                    <div className="flex items-center gap-2 text-primary-400 font-semibold group-hover:gap-4 transition-all">
                      Baca Selengkapnya
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-dark">
              Berita Terbaru
            </h2>
            <p className="mt-2 text-neutral-600">
              Update terkini seputar Brigata Curva Sud
            </p>
          </div>
          <Link 
            href="/news" 
            className="group flex items-center gap-2 rounded-xl bg-dark px-6 py-3 text-sm font-bold text-white transition-all hover:bg-dark-200 hover:gap-4"
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4 transition-transform" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(hero ? restArticles : articles).slice(0, 6).map((article, index) => (
            <article 
              key={article.id} 
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-2xl hover:border-primary-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Image Placeholder */}
              <div className="aspect-video w-full bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary-400/30" />
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                    {article.publishedAt ? format(article.publishedAt, "dd MMM yyyy") : "Draft"}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold leading-tight text-dark mb-3 group-hover:text-primary-600 transition-colors">
                  <Link href={`/news/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                
                <p className="text-sm text-neutral-600 line-clamp-3 mb-4">
                  {article.excerpt ?? article.body.slice(0, 120)}
                </p>

                <Link 
                  href={`/news/${article.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:gap-4 transition-all"
                >
                  Baca Artikel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section className="bg-gradient-to-b from-neutral-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-dark">
                Jadwal Pertandingan
              </h2>
              <p className="mt-2 text-neutral-600">
                Upcoming matches dan live updates
              </p>
            </div>
            <Link 
              href="/matches" 
              className="group flex items-center gap-2 rounded-xl border-2 border-dark px-6 py-3 text-sm font-bold text-dark transition-all hover:bg-dark hover:text-white hover:gap-4"
            >
              Lihat Kalender
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">Belum ada jadwal pertandingan terdekat.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:shadow-2xl animate-slide-up",
                    match.status === "LIVE" 
                      ? "border-red-500 shadow-lg shadow-red-500/20" 
                      : "border-neutral-200 hover:border-primary-400"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Live Badge */}
                  {match.status === "LIVE" && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                        </span>
                        LIVE
                      </span>
                    </div>
                  )}

                  {/* Match Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      {format(match.eventDate, "EEEE, dd MMM yyyy")}
                    </div>
                    <div className="text-sm font-bold text-primary-600 mb-1">
                      {format(match.eventDate, "HH:mm")} WIB
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-dark mb-2 leading-tight">
                      BCS <span className="text-neutral-400">vs</span> {match.opponent}
                    </h3>
                  </div>

                  {/* Venue & Competition */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <MapPin className="h-4 w-4 text-primary-500" />
                      <span>{match.venue}</span>
                    </div>
                  </div>

                  {/* Competition Badge */}
                  <div className="inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-700">
                    {match.competition}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Official Store Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-dark">
              Official Store
            </h2>
            <p className="mt-2 text-neutral-600">
              Merchandise resmi Brigata Curva Sud
            </p>
          </div>
          <Link 
            href="/store" 
            className="group flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-primary-400 hover:gap-4 hover:shadow-lg"
          >
            <ShoppingBag className="h-4 w-4" />
            Lihat Semua
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/store/${product.slug}`}
              className="group relative overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white transition-all duration-300 hover:shadow-2xl hover:border-primary-400 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Product Image Placeholder */}
              <div className="aspect-square w-full bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-primary-300/50" />
                </div>
                
                {/* New Badge */}
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-black shadow-lg">
                    NEW
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {product.slug}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                  {product.name}
                </h3>
                
                <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                  {product.description ?? "Merchandise resmi Brigata Curva Sud dengan kualitas terbaik."}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Mulai dari</div>
                    <div className="text-2xl font-black text-primary-600">
                      Rp{Math.min(...product.variants.map((v) => v.price)).toLocaleString("id-ID")}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:gap-4 transition-all">
                    Beli
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Engagement Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark via-dark-100 to-dark-200 py-20 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-stadium-pattern opacity-5"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Bergabung dengan Komunitas
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Jadilah bagian dari keluarga besar Brigata Curva Sud
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Volunteer Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary-500/50 hover:bg-white/10">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl transition-all duration-500 group-hover:bg-primary-500/30"></div>
              
              <div className="relative">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-400">
                  <Users className="h-4 w-4" />
                  Volunteer Program
                </div>
                
                <h3 className="text-3xl font-black text-white mb-4">
                  Gabung Jadi Kontributor
                </h3>
                
                <p className="text-neutral-300 mb-6 leading-relaxed">
                  Isi form singkat ini untuk bantu produksi konten, dokumentasi, merchandise, 
                  hingga kegiatan sosial. Bersama kita lebih kuat!
                </p>
                
                <div className="mt-6">
                  <VolunteerForm />
                </div>
              </div>
            </div>

            {/* Right Column - Poll & Newsletter */}
            <div className="space-y-6">
              {/* Poll Widget */}
              {poll ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-400">
                    <TrendingUp className="h-4 w-4" />
                    Active Poll
                  </div>
                  
                  <PollWidget
                    pollId={poll.id}
                    question={poll.question}
                    options={Object.entries(poll.optionsJson as Record<string, string>).map(([key, label]) => ({
                      key,
                      label,
                      votes: (poll.votes ?? []).filter((vote) => vote.optionKey === key).length
                    }))}
                  />
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm text-center">
                  <Calendar className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-400">Tidak ada polling aktif saat ini.</p>
                </div>
              )}

              {/* Newsletter Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary-900/30 to-primary-950/20 p-8 backdrop-blur-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-400">
                  <Mail className="h-4 w-4" />
                  Newsletter
                </div>
                
                <h3 className="text-2xl font-black text-white mb-3">
                  Stay Updated
                </h3>
                
                <p className="text-neutral-300 mb-6 text-sm leading-relaxed">
                  Dapatkan update matchday dan rilisan merchandise terbaru. 
                  Kami kirim rangkuman penting setiap pekan. Tanpa spam.
                </p>
                
                <div className="mt-6">
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
