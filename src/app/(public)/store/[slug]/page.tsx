import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeroSlider } from "@/components/page-hero-slider";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { getProductBySlug } from "@/server/services/store";

type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
type ProductComment = ProductDetail["comments"][number];
type ProductVariantDetail = ProductDetail["variants"][number];

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const variants = product.variants.map((variant: ProductVariantDetail) => {
    let label = variant.sku;
    if (variant.optionJson && typeof variant.optionJson === "object" && !Array.isArray(variant.optionJson)) {
      const values = Object.values(variant.optionJson as Record<string, unknown>).filter(
        (value): value is string => typeof value === "string"
      );
      if (values.length > 0) {
        label = values.join(" - ");
      }
    }
    return {
      id: variant.id,
      label,
      stock: variant.stock,
      price: variant.price
    };
  });

  const productComments: ProductComment[] = product.comments ?? [];
  const approvedComments = productComments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    authorName: comment.user?.name ?? "Anonim"
  })) ?? [];

  return (
    <>
      <PageHeroSlider
        title={product.name}
        height="small"
      />
      
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 lg:px-0">
        <Link href="/store" className="inline-block mb-8 text-sm text-secondary-600 hover:text-secondary-700">← Kembali ke Store</Link>
        
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        {product.coverUrl ? (
          <div className="relative h-80 w-full overflow-hidden rounded-2xl">
            <Image
              src={product.coverUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-80 w-full items-center justify-center rounded-2xl bg-neutral-700 text-sm text-neutral-400">
            Tidak ada gambar produk
          </div>
        )}

        <div>
          <h1 className="text-3xl font-semibold text-white">{product.name}</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">{product.description}</p>
        </div>

        {approvedComments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Ulasan</h2>
            <ul className="space-y-4">
              {approvedComments.map((comment) => (
                <li key={comment.id} className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{comment.authorName}</span>
                    <time className="text-xs text-neutral-400">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium"
                      }).format(comment.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">{comment.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="space-y-6 rounded-2xl border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">Mulai dari</p>
          <p className="text-2xl font-bold text-secondary-600">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0
            }).format(product.basePrice)}
          </p>
        </div>

        {variants.length > 0 ? (
          <AddToCartForm variants={variants} />
        ) : (
          <p className="text-sm text-neutral-400">Varian produk tidak tersedia</p>
        )}
        </aside>
        </div>
      </div>
    </>
  );
}
