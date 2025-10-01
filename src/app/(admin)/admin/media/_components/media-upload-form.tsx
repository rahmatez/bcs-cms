"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DEFAULT_TYPE = "image";

export function MediaUploadForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    url: "",
    type: DEFAULT_TYPE,
    width: "",
    height: "",
    alt: ""
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((state) => ({ ...state, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.url) {
      toast.error("Masukkan URL media terlebih dahulu");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url,
          type: form.type,
          width: form.width ? Number(form.width) : undefined,
          height: form.height ? Number(form.height) : undefined,
          alt: form.alt || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error ?? "Gagal menambahkan media");
        return;
      }

      toast.success("Media berhasil ditambahkan");
      setForm({ url: "", type: DEFAULT_TYPE, width: "", height: "", alt: "" });
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="text-sm font-medium text-neutral-700">
          URL Media
        </label>
        <input
          id="url"
          name="url"
          type="url"
          value={form.url}
          onChange={handleChange}
          placeholder="https://cdn.example.com/uploads/foto.jpg"
          className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Gunakan URL hasil upload S3 atau CDN. Integrasi upload langsung bisa ditambahkan kemudian.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="text-sm font-medium text-neutral-700">
            Tipe
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="image">Gambar</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <label htmlFor="width" className="text-sm font-medium text-neutral-700">
            Lebar (px)
          </label>
          <input
            id="width"
            name="width"
            type="number"
            min={0}
            value={form.width}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label htmlFor="height" className="text-sm font-medium text-neutral-700">
            Tinggi (px)
          </label>
          <input
            id="height"
            name="height"
            type="number"
            min={0}
            value={form.height}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div>
        <label htmlFor="alt" className="text-sm font-medium text-neutral-700">
          Alt text
        </label>
        <input
          id="alt"
          name="alt"
          type="text"
          value={form.alt}
          onChange={handleChange}
          placeholder="Deskripsi singkat untuk aksesibilitas"
          className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="mt-1 text-xs text-neutral-500">Maksimal 160 karakter.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="button-base bg-neutral-900 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan media"}
      </button>
    </form>
  );
}
