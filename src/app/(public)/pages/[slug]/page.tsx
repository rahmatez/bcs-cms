import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { PageHeroSlider } from "@/components/page-hero-slider";

const window = new JSDOM("" + "").window;
const purify = DOMPurify(window);

export default async function StaticPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <>
      <PageHeroSlider
        title={page.title}
        height="small"
      />
      
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="prose prose-neutral prose-invert max-w-none">
          <ReactMarkdown>{purify.sanitize(page.body)}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}
