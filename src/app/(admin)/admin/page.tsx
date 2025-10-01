import { auth } from "@/lib/auth";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminDashboardSnapshot } from "@/server/services/admin";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.role) {
    return null;
  }

  const snapshot = await getAdminDashboardSnapshot();
  const recentOrders = snapshot.recentOrders ?? [];
  const lowStockVariants = snapshot.lowStockVariants ?? [];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Hai {session.user.name ?? "Admin"}, berikut ringkasan performa 30 hari terakhir.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Artikel terbit"
          value={snapshot.totals.publishedArticles.toLocaleString("id-ID")}
          helperText={`${snapshot.totals.articles.toLocaleString("id-ID")} total artikel`}
        />
        <StatCard
          title="Pertandingan mendatang"
          value={snapshot.totals.upcomingMatches.toLocaleString("id-ID")}
          helperText="7 hari ke depan"
        />
        <StatCard
          title="Pesanan pending"
          value={snapshot.totals.pendingOrders.toLocaleString("id-ID")}
          helperText="Perlu verifikasi pembayaran"
        />
        <StatCard
          title="Revenue 30 hari"
          value={formatCurrency(snapshot.revenueLast30Days)}
          helperText="Status PAID ke atas"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">Pesanan terbaru</h2>
            <span className="text-xs text-neutral-500">5 transaksi terakhir</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentOrders.length === 0 && (
              <p className="px-5 py-6 text-sm text-neutral-500">Belum ada transaksi baru.</p>
            )}
            {recentOrders.map((order) => {
              const itemsTotal = order.items.reduce((sum, item) => sum + item.qty, 0);
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium text-neutral-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-neutral-500">
                      {order.user?.name ?? order.user?.email ?? "Tanpa nama"} • {itemsTotal} item • {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{formatCurrency(order.finalTotal)}</p>
                    <span className="text-xs uppercase tracking-wide text-neutral-500">{order.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-900">Stok menipis</h2>
              <p className="text-xs text-neutral-500">Varian dengan stok ≤ 5</p>
            </div>
            <div className="divide-y divide-neutral-100">
              {lowStockVariants.length === 0 && (
                <p className="px-5 py-6 text-sm text-neutral-500">Semua stok aman.</p>
              )}
              {lowStockVariants.map((variant) => (
                <div key={variant.id} className="px-5 py-4 text-sm">
                  <p className="font-medium text-neutral-900">{variant.product.name}</p>
                  <p className="text-neutral-500">
                    SKU {variant.sku} • Sisa {variant.stock} • Harga {formatCurrency(variant.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Subscriber baru</p>
              <p className="text-lg font-semibold text-neutral-900">{snapshot.totals.newSubscribers.toLocaleString("id-ID")}</p>
              <p className="text-xs text-neutral-500">30 hari terakhir</p>
            </div>
            <div className="h-px bg-neutral-100" />
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Volunteer baru</p>
              <p className="text-lg font-semibold text-neutral-900">{snapshot.totals.newVolunteers.toLocaleString("id-ID")}</p>
              <p className="text-xs text-neutral-500">30 hari terakhir</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
