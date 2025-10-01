"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { productFormSchema, type ProductFormValues } from "../_schema";
import { saveProductAction } from "../_actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ProductFormProps {
  productId?: string;
  initialValues?: ProductFormValues;
}

export function ProductForm({ productId, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues:
      initialValues ?? {
        name: "",
        slug: "",
        description: "",
        basePrice: 0,
        status: "ACTIVE",
        coverUrl: "",
        variants: [
          {
            id: undefined,
            label: "",
            sku: "",
            stock: 0,
            price: 0
          }
        ]
      }
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = form;

  const nameValue = watch("name");
  const slugValue = watch("slug");

  useEffect(() => {
    if (!productId && !slugValue && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugValue, setValue, productId]);

  const variants = useFieldArray({
    control,
    name: "variants"
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveProductAction({ ...values, productId });
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menyimpan produk");
        return;
      }

      toast.success("Produk berhasil disimpan");
      router.push(`/admin/products/${result.productId}`);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <section className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="name">
              Nama produk
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Contoh: Jersey Home 2025"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="slug">
              Slug URL
            </label>
            <input
              id="slug"
              type="text"
              {...register("slug")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="jersey-home-2025"
            />
            <p className="mt-1 text-xs text-neutral-500">Gunakan huruf kecil, angka, dan tanda hubung.</p>
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="description">
              Deskripsi
            </label>
            <textarea
              id="description"
              rows={5}
              {...register("description")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ceritakan detail produk, bahan, dan cara perawatan"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="basePrice">
              Harga dasar
            </label>
            <input
              id="basePrice"
              type="number"
              min={0}
              step={1000}
              {...register("basePrice", { valueAsNumber: true })}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="coverUrl">
              URL gambar utama
            </label>
            <input
              id="coverUrl"
              type="url"
              {...register("coverUrl")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="https://cdn.example.com/produk.jpg"
            />
            <p className="mt-1 text-xs text-neutral-500">Kosongkan jika belum ada gambar.</p>
            {errors.coverUrl && <p className="mt-1 text-xs text-red-600">{errors.coverUrl.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Varian produk</h2>
            <p className="text-xs text-neutral-500">Kelola SKU, stok, dan harga per varian.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              variants.append({
                id: undefined,
                label: "",
                sku: "",
                stock: 0,
                price: 0
              })
            }
            className="button-base bg-primary text-primary-foreground"
          >
            Tambah varian
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {variants.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="text-xs font-medium text-neutral-600" htmlFor={`variants.${index}.label`}>
                      Label varian
                    </label>
                    <input
                      id={`variants.${index}.label`}
                      type="text"
                      {...register(`variants.${index}.label` as const)}
                      className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Contoh: Size M"
                    />
                    {errors.variants?.[index]?.label && (
                      <p className="mt-1 text-xs text-red-600">{errors.variants[index]?.label?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-600" htmlFor={`variants.${index}.sku`}>
                      SKU
                    </label>
                    <input
                      id={`variants.${index}.sku`}
                      type="text"
                      {...register(`variants.${index}.sku` as const)}
                      className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="BCS-JERSEY-25-M"
                    />
                    {errors.variants?.[index]?.sku && (
                      <p className="mt-1 text-xs text-red-600">{errors.variants[index]?.sku?.message}</p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-neutral-600" htmlFor={`variants.${index}.stock`}>
                        Stok
                      </label>
                      <input
                        id={`variants.${index}.stock`}
                        type="number"
                        min={0}
                        {...register(`variants.${index}.stock` as const, { valueAsNumber: true })}
                        className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.variants?.[index]?.stock && (
                        <p className="mt-1 text-xs text-red-600">{errors.variants[index]?.stock?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600" htmlFor={`variants.${index}.price`}>
                        Harga varian
                      </label>
                      <input
                        id={`variants.${index}.price`}
                        type="number"
                        min={0}
                        step={1000}
                        {...register(`variants.${index}.price` as const, { valueAsNumber: true })}
                        className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.variants?.[index]?.price && (
                        <p className="mt-1 text-xs text-red-600">{errors.variants[index]?.price?.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {variants.fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => variants.remove(index)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {typeof errors.variants?.root?.message === "string" && (
          <p className="mt-2 text-xs text-red-600">{errors.variants.root.message}</p>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="button-base min-w-[180px] bg-neutral-900 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan produk"}
        </button>
      </div>
    </form>
  );
}
