import Image from "next/image";
import Link from "next/link";

import { listProducts } from "@/server/services/store";

export default async function StorePage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = typeof searchParams.query === "string" ? searchParams.query : undefined;
  const { items } = await listProducts({ query, page: 1, pageSize: 20 });
  type Product = (typeof items)[number];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-10 lg:px-0">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-neutral-900">Merchandise Official BCS</h1>
        <p className="text-sm text-neutral-600">
          Dukung klub kebanggaanmu dengan ragam merchandise eksklusif, siap dikirim ke seluruh Indonesia.
        </p>
      </div>

      <form className="mx-auto flex w-full max-w-md gap-2">
        <input
          name="query"
          type="search"
          defaultValue={query}
          placeholder="Cari produk"
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button type="submit" className="button-base bg-primary text-primary-foreground">
          Cari
        </button>
      </form>

      {query && (
        <p className="text-sm text-neutral-500">
          Hasil pencarian untuk: <span className="font-medium text-neutral-700">{query}</span>
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product: Product) => (
          <Link
            key={product.id}
            href={`/store/${product.slug}`}
            className="group flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
          >
            {product.coverUrl ? (
              <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                <Image
                  src={product.coverUrl}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-t-2xl bg-neutral-100 text-sm text-neutral-500">
                Tidak ada gambar
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{product.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{product.description}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">Mulai dari</p>
                <p className="text-xl font-bold text-primary">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                  }).format(product.basePrice)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-sm text-neutral-500">
          Merchandise belum tersedia atau pencarian tidak ditemukan. Silakan kembali lagi nanti!
        </p>
      )}
    </div>
  );
}
