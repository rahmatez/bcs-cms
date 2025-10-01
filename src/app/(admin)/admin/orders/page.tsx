import { auth } from "@/lib/auth";
import { listOrders } from "@/server/services/store";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction, updateShipmentAction } from "./_actions";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  PAID: "Dibayar",
  PACKED: "Dikemas",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELED: "Batal"
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PACKED: "bg-sky-100 text-sky-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-neutral-900 text-white",
  CANCELED: "bg-red-100 text-red-600"
};

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 16);
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user?.role || !session.user.id) {
    return null;
  }

  const rawStatus = typeof searchParams?.status === "string" ? searchParams.status.toUpperCase() : "ALL";
  const status = (Object.values(OrderStatus) as string[]).includes(rawStatus)
    ? (rawStatus as OrderStatus)
    : "ALL";

  const orders = await listOrders({ userId: session.user.id, role: session.user.role, status });

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Pesanan</h1>
        <p className="text-sm text-neutral-500">Pantau status pembayaran dan pengiriman merchandise.</p>
      </section>

      <form className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:gap-4">
        <label className="text-sm text-neutral-500" htmlFor="status-filter">
          Filter status
        </label>
        <select
          id="status-filter"
          name="status"
          defaultValue={status}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-60"
        >
          <option value="ALL">Semua</option>
          <option value="PENDING">Menunggu</option>
          <option value="PAID">Dibayar</option>
          <option value="PACKED">Dikemas</option>
          <option value="SHIPPED">Dikirim</option>
          <option value="COMPLETED">Selesai</option>
          <option value="CANCELED">Batal</option>
        </select>
        <button type="submit" className="button-base w-full bg-neutral-900 text-white sm:w-auto">
          Terapkan
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[1.5fr,1.5fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Order</span>
          <span>Pelanggan</span>
          <span>Status</span>
          <span>Total</span>
        </div>
        {orders.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Belum ada pesanan.</p>}
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-[1.5fr,1.5fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-5 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-neutral-900">#{order.id.slice(0, 10)}</p>
              <p className="text-xs text-neutral-500">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(order.createdAt)}
              </p>
              <p className="text-xs text-neutral-500">{order.items.length} item</p>
            </div>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-neutral-900">{order.user.name ?? "Tanpa nama"}</p>
                <p className="text-xs text-neutral-500">{order.user.email}</p>
              </div>
              <form action={updateShipmentAction} className="grid gap-2 rounded-lg border border-neutral-200 p-3 text-xs">
                <input type="hidden" name="orderId" value={order.id} />
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                      Kurir
                    </label>
                    <input
                      type="text"
                      name="courier"
                      defaultValue={order.shipment?.courier ?? ""}
                      className="mt-1 w-full rounded-md border border-neutral-200 px-2 py-1 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                      No. Resi
                    </label>
                    <input
                      type="text"
                      name="trackingNumber"
                      defaultValue={order.shipment?.trackingNumber ?? ""}
                      className="mt-1 w-full rounded-md border border-neutral-200 px-2 py-1 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                    Tanggal kirim
                  </label>
                  <input
                    type="datetime-local"
                    name="shippedAt"
                    defaultValue={formatDateInput(order.shipment?.shippedAt ?? null)}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-2 py-1 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-900 px-3 py-2 font-medium text-white transition hover:bg-neutral-800"
                >
                  Simpan pengiriman
                </button>
              </form>
            </div>
            <div className="space-y-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  STATUS_CLASS[order.status] ?? "bg-neutral-200 text-neutral-600"
                }`}
              >
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
              <form action={updateOrderStatusAction} className="grid gap-2 rounded-lg border border-neutral-200 p-3 text-xs">
                <input type="hidden" name="orderId" value={order.id} />
                <label className="block text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  Ubah status
                </label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="rounded-md border border-neutral-200 px-2 py-1 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="PENDING">Menunggu</option>
                  <option value="PAID">Dibayar</option>
                  <option value="PACKED">Dikemas</option>
                  <option value="SHIPPED">Dikirim</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="CANCELED">Batal</option>
                </select>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-900 px-3 py-2 font-medium text-white transition hover:bg-neutral-800"
                >
                  Simpan status
                </button>
              </form>
              <p className="text-xs text-neutral-500">Metode: {order.paymentMethod}</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <p className="font-semibold text-neutral-900">{formatCurrency(order.finalTotal)}</p>
              {order.discount > 0 ? (
                <p className="text-xs text-neutral-500">Diskon {formatCurrency(order.discount)}</p>
              ) : null}
              {order.shippingAddressJson ? (
                <details className="w-full text-left text-xs text-neutral-500">
                  <summary className="cursor-pointer select-none text-neutral-600">Alamat kirim</summary>
                  <div className="mt-2 space-y-1">
                    {Object.entries(order.shippingAddressJson as Record<string, unknown>).map(([key, value]) => (
                      <p key={key}>
                        <span className="capitalize text-neutral-400">{key}:</span> {String(value)}
                      </p>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
