import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("" + "").window;
const purify = DOMPurify(window);

export default async function StaticPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-display font-semibold">{page.title}</h1>
      <div className="prose prose-neutral mt-8 max-w-none">
        <ReactMarkdown>{purify.sanitize(page.body)}</ReactMarkdown>
      </div>
    </div>
  );
}
