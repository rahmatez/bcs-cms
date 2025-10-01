"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { pageFormSchema, type PageFormValues } from "../_schema";
import { deletePageAction, savePageAction } from "../_actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface PageFormProps {
  pageId?: string;
  initialValues?: PageFormValues;
}

export function PageForm({ pageId, initialValues }: PageFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues:
      initialValues ?? {
        title: "",
        slug: "",
        body: "",
        status: "DRAFT",
        publishedAt: ""
      }
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = form;

  const title = watch("title");
  const slug = watch("slug");

  useEffect(() => {
    if (pageId) return;
    if (!title || slug) return;
    setValue("slug", slugify(title));
  }, [pageId, title, slug, setValue]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await savePageAction({ ...values, pageId });
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menyimpan halaman");
        return;
      }

      toast.success("Halaman tersimpan");
      router.push(`/admin/pages/${result.pageId}`);
      router.refresh();
    });
  });

  const handleDelete = () => {
    if (!pageId || !initialValues) return;
    const confirmed = window.confirm("Hapus halaman ini?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deletePageAction(pageId, initialValues.slug);
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menghapus halaman");
        return;
      }

      toast.success("Halaman dihapus");
      router.push("/admin/pages");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <label htmlFor="title" className="text-sm font-medium text-neutral-700">
            Judul halaman
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Contoh: Tentang BCS"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="slug" className="text-sm font-medium text-neutral-700">
            Slug URL
          </label>
          <input
            id="slug"
            type="text"
            {...register("slug")}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="tentang-bcs"
          />
          <p className="mt-1 text-xs text-neutral-500">Slug menentukan URL publik: /pages/slug.</p>
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>

        <div>
          <label htmlFor="body" className="text-sm font-medium text-neutral-700">
            Konten
          </label>
          <textarea
            id="body"
            rows={14}
            {...register("body")}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Tuliskan konten markdown di sini..."
          />
          {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="status" className="text-sm font-medium text-neutral-700">
              Status
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Terbit</option>
            </select>
            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>}
          </div>
          <div>
            <label htmlFor="publishedAt" className="text-sm font-medium text-neutral-700">
              Jadwal terbit
            </label>
            <input
              id="publishedAt"
              type="datetime-local"
              {...register("publishedAt")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="mt-1 text-xs text-neutral-500">Kosongkan untuk publikasi manual.</p>
            {errors.publishedAt && <p className="mt-1 text-xs text-red-600">{errors.publishedAt.message}</p>}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        {pageId ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            Hapus halaman
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="button-base min-w-[180px] bg-neutral-900 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan halaman"}
        </button>
      </div>
    </form>
  );
}
