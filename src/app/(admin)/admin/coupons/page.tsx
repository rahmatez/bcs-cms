import Link from "next/link";

import { auth } from "@/lib/auth";
import { listCoupons } from "@/server/services/store";

function formatValue(type: string, value: number) {
  if (type === "PERCENT") {
    return `${value}%`;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(value);
}

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session?.user?.role) {
    return null;
  }

  const coupons = await listCoupons();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Kupon Diskon</h1>
          <p className="text-sm text-neutral-500">Atur promo, flash sale, dan kode diskon untuk supporter.</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="button-base inline-flex items-center gap-2 bg-primary text-primary-foreground"
        >
          Buat kupon
        </Link>
      </section>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Kode</span>
          <span>Nilai</span>
          <span>Masa berlaku</span>
          <span>Minimum belanja</span>
          <span>Terpakai</span>
        </div>
        {coupons.length === 0 && (
          <p className="px-5 py-6 text-sm text-neutral-500">Belum ada kupon aktif.</p>
        )}
        {coupons.map((coupon) => {
          const starts = coupon.startsAt
            ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(coupon.startsAt)
            : "Segera";
          const ends = coupon.endsAt
            ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(coupon.endsAt)
            : "Tidak ditentukan";

          return (
            <Link
              key={coupon.id}
              href={`/admin/coupons/${coupon.id}`}
              className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-4 text-sm transition hover:bg-neutral-50"
            >
              <span className="font-medium text-neutral-900">{coupon.code}</span>
              <span className="text-neutral-700">{formatValue(coupon.type, coupon.value)}</span>
              <span className="text-neutral-500">{starts} - {ends}</span>
              <span className="text-neutral-700">
                {coupon.minSpend
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0
                    }).format(coupon.minSpend)
                  : "Tanpa minimum"}
              </span>
              <span className="text-neutral-700">{coupon._count.orders}/{coupon.usageLimit ?? "∞"}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
