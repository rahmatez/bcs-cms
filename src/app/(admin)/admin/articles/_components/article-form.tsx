"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { saveArticleAction, deleteArticleAction } from "../_actions";
import { articleFormSchema, type ArticleFormValues } from "../_schema";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ArticleFormProps {
  articleId?: string;
  categories: Array<{ id: string; name: string }>;
  initialValues?: ArticleFormValues;
}

export function ArticleForm({ articleId, categories, initialValues }: ArticleFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues:
      initialValues ?? {
        title: "",
        slug: "",
        excerpt: "",
        body: "",
        coverUrl: "",
        status: "DRAFT",
        publishedAt: "",
        categoryIds: []
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
    if (articleId) return;
    if (!title || slug) return;
    setValue("slug", slugify(title));
  }, [articleId, title, slug, setValue]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveArticleAction({ ...values, articleId });
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menyimpan artikel");
        return;
      }

      toast.success("Artikel tersimpan");
      router.push(`/admin/articles/${result.articleId}`);
      router.refresh();
    });
  });

  const handleDelete = () => {
    if (!articleId) return;
    const confirmed = window.confirm("Yakin ingin menghapus artikel ini?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteArticleAction(articleId);
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menghapus artikel");
        return;
      }

      toast.success("Artikel dihapus");
      router.push("/admin/articles");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <section className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium text-neutral-700">
              Judul artikel
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Contoh: Laporan Laga Terakhir"
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
              placeholder="laporan-laga-terakhir"
            />
            <p className="mt-1 text-xs text-neutral-500">Slug menentukan URL artikel di halaman publik.</p>
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
          </div>

          <div>
            <label htmlFor="excerpt" className="text-sm font-medium text-neutral-700">
              Ringkasan
            </label>
            <textarea
              id="excerpt"
              rows={3}
              {...register("excerpt")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ringkas konten artikel untuk teaser di homepage."
            />
            <p className="mt-1 text-xs text-neutral-500">Maksimal 280 karakter.</p>
            {errors.excerpt && <p className="mt-1 text-xs text-red-600">{errors.excerpt.message}</p>}
          </div>

          <div>
            <label htmlFor="body" className="text-sm font-medium text-neutral-700">
              Konten utama
            </label>
            <textarea
              id="body"
              rows={16}
              {...register("body")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Tulis artikel lengkap di sini..."
            />
            {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="coverUrl" className="text-sm font-medium text-neutral-700">
              URL Gambar Sampul
            </label>
            <input
              id="coverUrl"
              type="url"
              {...register("coverUrl")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="https://cdn.example.com/article-cover.jpg"
            />
            <p className="mt-1 text-xs text-neutral-500">Kosongkan jika belum ada gambar.</p>
            {errors.coverUrl && <p className="mt-1 text-xs text-red-600">{errors.coverUrl.message}</p>}
          </div>

          <div>
            <label htmlFor="status" className="text-sm font-medium text-neutral-700">
              Status publikasi
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Menunggu review</option>
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
            <p className="mt-1 text-xs text-neutral-500">Kosongkan jika ingin publish manual.</p>
            {errors.publishedAt && <p className="mt-1 text-xs text-red-600">{errors.publishedAt.message}</p>}
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-700">Kategori</p>
            <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 p-3">
              {categories.map((category) => {
                const inputId = `category-${category.id}`;
                return (
                  <label key={category.id} htmlFor={inputId} className="flex items-center gap-2 text-sm">
                    <input
                      id={inputId}
                      type="checkbox"
                      value={category.id}
                      {...register("categoryIds")}
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span>{category.name}</span>
                  </label>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-neutral-500">Belum ada kategori. Tambahkan via seeder atau database.</p>
              )}
            </div>
            {errors.categoryIds && typeof errors.categoryIds.message === "string" ? (
              <p className="mt-1 text-xs text-red-600">{errors.categoryIds.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        {articleId ? (
          <button
            type="button"
            className="text-sm font-medium text-red-600 hover:underline"
            onClick={handleDelete}
            disabled={pending}
          >
            Hapus artikel
          </button>
        ) : <span />}
        <button
          type="submit"
          disabled={pending}
          className="button-base min-w-[180px] bg-neutral-900 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan artikel"}
        </button>
      </div>
    </form>
  );
}
