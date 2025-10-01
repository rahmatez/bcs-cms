import Link from "next/link";

import { auth } from "@/lib/auth";
import { listAdminProducts } from "@/server/services/store";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user?.role) {
    return null;
  }

  const query = typeof searchParams?.query === "string" ? searchParams.query : undefined;
  const rawStatus = typeof searchParams?.status === "string" ? searchParams.status.toUpperCase() : "ALL";
  const status = rawStatus === "ACTIVE" || rawStatus === "INACTIVE" ? rawStatus : "ALL";

  const products = await listAdminProducts({ query, status });

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Produk</h1>
          <p className="text-sm text-neutral-500">Kelola katalog merchandise resmi BCS.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="button-base inline-flex items-center gap-2 bg-primary text-primary-foreground"
        >
          Tambah produk
        </Link>
      </section>

      <form className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-[2fr,1fr,auto]">
        <input
          type="search"
          name="query"
          defaultValue={query}
          placeholder="Cari nama produk atau SKU"
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="ALL">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
        </select>
        <button type="submit" className="button-base bg-neutral-900 text-white">
          Terapkan
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Produk</span>
          <span>Status</span>
          <span>Stok</span>
          <span>Varian</span>
        </div>
        {products.length === 0 && (
          <p className="px-5 py-6 text-sm text-neutral-500">Belum ada produk sesuai filter.</p>
        )}
        {products.map((product) => {
          const totalStock = product.variants.reduce<number>((sum, variant) => sum + variant.stock, 0);
          const variantCount = product.variants.length;
          return (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-4 text-sm transition hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{product.name}</p>
                <p className="text-xs text-neutral-500">Slug: {product.slug}</p>
                <p className="mt-1 text-xs text-neutral-500">Harga dasar {formatCurrency(product.basePrice)}</p>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    product.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {product.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="text-neutral-700">{totalStock.toLocaleString("id-ID")}</div>
              <div className="text-neutral-700">{variantCount} varian</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
