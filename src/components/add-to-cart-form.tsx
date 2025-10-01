"use client";

import { useState } from "react";
import { toast } from "sonner";

interface VariantOption {
  id: string;
  label: string;
  stock: number;
  price: number;
}

export function AddToCartForm({ variants }: { variants: VariantOption[] }) {
  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const selectedVariant = variants.find((variant) => variant.id === variantId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!variantId) {
      toast.error("Pilih variasi terlebih dahulu");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productVariantId: variantId, qty })
    });
    setLoading(false);

    if (response.ok) {
      toast.success("Berhasil masuk keranjang");
    } else if (response.status === 401) {
      toast.error("Masuk terlebih dahulu untuk berbelanja");
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal menambahkan ke cart");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <span className="text-sm font-medium text-neutral-600">Pilih varian</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {variants.map((variant) => (
            <label
              key={variant.id}
              className={`rounded-lg border px-3 py-3 text-sm transition ${variant.id === variantId ? "border-primary bg-primary/10" : "border-neutral-200 hover:border-primary"}`}
            >
              <input
                type="radio"
                name="variant"
                value={variant.id}
                className="hidden"
                checked={variantId === variant.id}
                onChange={() => setVariantId(variant.id)}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-neutral-900">{variant.label}</span>
                <span className="text-xs text-neutral-500">Stock: {variant.stock}</span>
                <span className="mt-1 text-sm font-semibold text-neutral-900">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                  }).format(variant.price)}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-neutral-600" htmlFor="cart-qty">
          Jumlah
        </label>
        <input
          id="cart-qty"
          type="number"
          min={1}
          value={qty}
          onChange={(event) => setQty(Number(event.target.value))}
          className="w-20 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !selectedVariant}
        className="button-base w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? "Menambahkan..." : "Tambah ke keranjang"}
      </button>
    </form>
  );
}
