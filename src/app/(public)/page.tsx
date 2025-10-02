import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ArrowRight, Calendar, Mail, Share2, Users, Youtube, Twitter, Instagram, TrendingUp } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { PollWidget } from "@/components/poll-widget";
import { VolunteerForm } from "@/components/volunteer-form";
import { HeroSlider } from "@/components/hero-slider";
import type { Article, PollVote } from "@prisma/client";

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

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider */}
      <section className="relative h-screen overflow-hidden">
        {/* Hero Slider Background */}
        <HeroSlider />
        
        {/* Hero Content */}
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            {/* Emblem/Logo */}
            <div className="mb-8 flex justify-center animate-scale-in">
              <div className="relative h-40 w-40 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 shadow-2xl">
                <Image
                  src="/images/logo/EMBLEM.png"
                  alt="BCS Logo"
                  width={120}
                  height={120}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-5xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl animate-slide-up drop-shadow-2xl">
              BRIGATA CURVA SUD
            </h1>
            
            {/* Tagline */}
            <p className="mx-auto mb-12 max-w-2xl text-xl text-white leading-relaxed animate-fade-in drop-shadow-lg" style={{ animationDelay: "200ms" }}>
              Here we pour out our feelings <br />
              about love and anger for pride.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <Link
                href="/news"
                className="group inline-flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm px-8 py-4 text-base font-bold text-neutral-900 shadow-2xl transition-all duration-300 hover:bg-white hover:scale-105"
              >
                Explore News
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pages/about"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section - Inspired by template value section */}
      <section className="bg-neutral-900 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Image with Orbe Effect */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[316px] w-[266px] rounded-[135px_135px_16px_16px] bg-neutral-800"></div>
              </div>
              <div className="relative z-10 h-[300px] w-[250px] overflow-hidden rounded-[125px_125px_12px_12px] shadow-2xl shadow-primary/30">
                <Image
                  src="/images/value-img.JPG"
                  alt="Who We Are"
                  fill
                  className="object-cover"
                  sizes="250px"
                />
              </div>
            </div>

            {/* Content */}
            <div className="animate-slide-up">
              <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wider text-secondary-600">
                Who We Are
              </span>
              <h2 className="mb-6 text-4xl font-black text-white lg:text-5xl">
                BRIGATA CURVA SUD
              </h2>
              <p className="mb-6 text-neutral-300 leading-relaxed">
                "Brigata Curva Sud" is a community of supporters dedicated to PSS Sleman football club. 
                The name describes the enthusiasm and courage of its members in supporting their favorite team.
              </p>
              <p className="mb-8 text-neutral-300 leading-relaxed">
                "Brigata Curva Sud" is not just a supporter group, but also a family for its members. 
                We provide a platform for the exchange of ideas, experiences and social activities that strengthen 
                relationships among fellow football fans. With a spirit of togetherness and high dedication, 
                we continue to be an important pillar in maintaining the football tradition.
              </p>
              <Link
                href="/pages/about"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-primary-600 hover:shadow-xl hover:scale-105"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Inspired by template blog section */}
      <section className="bg-neutral-900 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wider text-secondary-600">
              Our Blog
            </span>
            <h2 className="text-4xl font-black text-white lg:text-5xl">
              Speech For The Pride
            </h2>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: Article, index: number) => (
              <article 
                key={article.id} 
                className="group relative overflow-hidden rounded-2xl bg-neutral-800 shadow-lg transition-all duration-300 hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-700">
                  {article.coverUrl ? (
                    <Image
                      src={article.coverUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <>
                      <Image
                        src="/images/blog-top.jpg"
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/60"></div>
                    </>
                  )}
                  
                  {/* Arrow Button Overlay */}
                  <Link
                    href={`/news/${article.slug}`}
                    className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900/80 backdrop-blur-sm text-white shadow-lg transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110"
                  >
                    <ArrowRight className="h-5 w-5 transform rotate-[-30deg]" />
                  </Link>
                </div>

                {/* Content */}
                <div className="p-6">
                  <Link href={`/news/${article.slug}`}>
                    <h3 className="mb-3 text-xl font-bold text-white leading-tight group-hover:text-secondary-600 transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  
                  <p className="mb-4 text-sm text-neutral-400 line-clamp-3">
                    {article.excerpt ?? article.body.slice(0, 120)}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{article.publishedAt ? format(article.publishedAt, "dd MMM yyyy") : "Draft"}</span>
                    </div>
                    <button className="flex items-center gap-2 text-neutral-400 hover:text-secondary-600 transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-3 text-base font-bold text-white transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105"
            >
              View All Articles
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section - Inspired by template contact section */}
      <section className="bg-neutral-900 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Content */}
            <div>
              <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wider text-secondary-600">
                Need Information
              </span>
              <h2 className="mb-6 text-4xl font-black text-white lg:text-5xl">
                Don't hesitate to contact us
              </h2>
              <p className="mb-8 text-neutral-300 leading-relaxed">
                Are you still confused about the information on this website page? 
                Don't worry, just contact us for more information.
              </p>

              {/* Contact Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* YouTube Card */}
                <div className="group rounded-xl border-2 border-neutral-700 bg-neutral-800 p-6 transition-all duration-300 hover:border-primary-500 hover:shadow-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-700 text-white">
                      <Youtube className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">YouTube</h3>
                      <p className="text-xs text-neutral-400">brigadacurvasud</p>
                    </div>
                  </div>
                  <a
                    href="https://www.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-lg bg-neutral-700 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Visit Now
                  </a>
                </div>

                {/* Twitter Card */}
                <div className="group rounded-xl border-2 border-neutral-700 bg-neutral-800 p-6 transition-all duration-300 hover:border-primary-500 hover:shadow-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-700 text-white">
                      <Twitter className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Twitter</h3>
                      <p className="text-xs text-neutral-400">@brigadacurvasud</p>
                    </div>
                  </div>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-lg bg-neutral-700 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Visit Now
                  </a>
                </div>

                {/* Instagram Card */}
                <div className="group rounded-xl border-2 border-neutral-700 bg-neutral-800 p-6 transition-all duration-300 hover:border-primary-500 hover:shadow-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-700 text-white">
                      <Instagram className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Instagram</h3>
                      <p className="text-xs text-neutral-400">@brigadacurvasud</p>
                    </div>
                  </div>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-lg bg-neutral-700 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Visit Now
                  </a>
                </div>

                {/* Email Card */}
                <div className="group rounded-xl border-2 border-neutral-700 bg-neutral-800 p-6 transition-all duration-300 hover:border-primary-500 hover:shadow-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-700 text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Email</h3>
                      <p className="text-xs text-neutral-400">halo@bcs.id</p>
                    </div>
                  </div>
                  <a
                    href="mailto:halo@bcs.id"
                    className="block w-full rounded-lg bg-neutral-700 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Email Now
                  </a>
                </div>
              </div>
            </div>

            {/* Image with Orbe Effect */}
            <div className="relative flex justify-center order-first lg:order-last">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[316px] w-[266px] rounded-[135px_135px_16px_16px] bg-neutral-800"></div>
              </div>
              <div className="relative z-10 h-[300px] w-[250px] overflow-hidden rounded-[125px_125px_12px_12px] shadow-2xl shadow-primary/30">
                <Image
                  src="/images/contact-img.png"
                  alt="Contact Us"
                  fill
                  className="object-cover"
                  sizes="250px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Engagement Section */}
      <section className="py-16 lg:py-24 bg-neutral-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-stadium-pattern opacity-10"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-black tracking-tight">
              Join Our Community
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-white/90">
              Be part of the Brigata Curva Sud family
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Volunteer Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/30 hover:bg-white/10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-400">
                <Users className="h-4 w-4" />
                Volunteer Program
              </div>
              
              <h3 className="mb-4 text-3xl font-black text-white">
                Join as a Contributor
              </h3>
              
              <p className="mb-6 text-white/80 leading-relaxed">
                Fill out this short form to help with content production, documentation, merchandise, 
                and social activities. Together we are stronger!
              </p>
              
              <div className="mt-6">
                <VolunteerForm />
              </div>
            </div>

            {/* Right Column - Poll & Newsletter */}
            <div className="space-y-6">
              {/* Poll Widget */}
              {poll ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-400">
                    <TrendingUp className="h-4 w-4" />
                    Active Poll
                  </div>
                  
                  <PollWidget
                    pollId={poll.id}
                    question={poll.question}
                    options={Object.entries(poll.optionsJson as Record<string, string>).map(([key, label]) => ({
                      key,
                      label,
                      votes: (poll.votes ?? []).filter((vote: PollVote) => vote.optionKey === key).length
                    }))}
                  />
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-white/50" />
                  <p className="text-white/70">No active poll at this time.</p>
                </div>
              )}

              {/* Newsletter Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-400">
                  <Mail className="h-4 w-4" />
                  Newsletter
                </div>
                
                <h3 className="mb-3 text-2xl font-black text-white">
                  Stay Updated
                </h3>
                
                <p className="mb-6 text-sm text-white/80 leading-relaxed">
                  Get matchday updates and the latest merchandise releases. 
                  We send important summaries every week. No spam.
                </p>
                
                <div className="mt-6">
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 lg:py-24 bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-4xl font-black text-white">
                Watch Our Journey
              </h2>
              <p className="text-neutral-300">
                Experience the passion and dedication of our supporters
              </p>
            </div>
            
            <div className="aspect-video overflow-hidden rounded-2xl shadow-2xl">
              <iframe 
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="YouTube video player" 
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
